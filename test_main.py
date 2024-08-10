import asyncio
from aiohttp import web, ClientSession
from aiogram import Bot, Dispatcher, Router, types, F
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from aiogram.filters import CommandStart
from aiohttp.web import Request, json_response
import requests

TOKEN = "6348055484:AAGhOv6sx5B4acQj-XUfRWV3kJz53FvioWs" #TasuAdmin

bot_id = 1026795763
dp = Dispatcher()

bot = Bot(token=TOKEN)

WEB_SERVER_HOST = "127.0.0.1"
# Port for incoming request from reverse proxy. Should be any available port
WEB_SERVER_PORT = 5173

# Path to webhook route, on which Telegram will send requests
WEBHOOK_PATH = r"/webhook"
# Secret key to validate requests from Telegram (optional)
WEBHOOK_SECRET = "my-secret"
# Base URL for webhook will be used to generate webhook URL for Telegram,
# in this example it is used public DNS with HTTPS support
BASE_WEBHOOK_URL = "https://08a1-2-36-105-41.ngrok-free.app"

# All handlers should be attached to the Router (or Dispatcher)
router = Router()

@router.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    keyboard = post_link()
    await message.answer("start", reply_markup=keyboard)

@router.callback_query(F.data == 'send_data')
async def send_data(callback_query: types.CallbackQuery):
    url = f"{BASE_WEBHOOK_URL}/send"
    data = {
        "test": "test"
    }
    async with ClientSession() as session:
        async with session.post(url, json=data) as response:
            if response.headers['Content-Type'] == 'application/json':
                response_data = await response.json()
                print(response_data)
            else:
                print(f"Unexpected content type: {response.headers['Content-Type']}")

async def handle_post(request: Request):
    try:
        data = await request.json()
        userId = data.get('userId')
        title = data.get('title')
        description = data.get('description')
        tag = data.get('tag')
        dateTime = data.get('dateTime')
        
        print(f"user_id: {userId}, Title: {title}, Description: {description}, Tag: {tag}, DateTime: {dateTime}")
        
        return web.json_response({'status': 'success', 'message': 'Dati ricevuti con successo'})
    except Exception as e:
        print(f"Errore durante la gestione della richiesta POST: {e}")
        return web.json_response({'status': 'error', 'message': 'Errore durante la gestione della richiesta POST'}, status=500)

def post_link():
    keyboard = []
    keyboard.append([types.InlineKeyboardButton(text="link", web_app=types.WebAppInfo(url=BASE_WEBHOOK_URL))])
    keyboard.append([types.InlineKeyboardButton(text="send_data", callback_data='send_data')])
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=keyboard)
    return keyboard

process = True

async def on_startup(bot: Bot) -> None:
    await bot.delete_webhook()
    await bot.set_webhook(f"{BASE_WEBHOOK_URL}{WEBHOOK_PATH}", secret_token=WEBHOOK_SECRET)

async def on_shutdown():
    await bot.delete_webhook()

async def handle(request):
    return web.FileResponse('./dist/index.html')

async def main():
    try:
        app = web.Application()
        dp.startup.register(on_startup)
        dp.include_router(router)

        app.router.add_get('/', handle)
        app.router.add_static('/assets/', path='./dist/assets', name='assets')
        app.router.add_post('/post', handle_post)
        #app.router.add_post('/send', send_data)
        #app.router.add_get('/send', send_data)

        webhook_requests_handler = SimpleRequestHandler(
            dispatcher=dp,
            bot=bot,
            secret_token=WEBHOOK_SECRET,
        )
        webhook_requests_handler.register(app, path=WEBHOOK_PATH)

        setup_application(app, dp, bot=bot)

        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(runner, host=WEB_SERVER_HOST, port=WEB_SERVER_PORT)
        await site.start()
        
        print(f"Server running at http://{WEB_SERVER_HOST}:{WEB_SERVER_PORT}")
        while True:
            await asyncio.sleep(3600)
    except Exception as ex:
        print(f"Errore durante l'esecuzione di handle_set_state: {ex}", exc_info=True)
    except KeyboardInterrupt:
        print("Interrotto dall'utente")
    finally:
        await on_shutdown()

if __name__ == '__main__':
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    loop.run_until_complete(main())
