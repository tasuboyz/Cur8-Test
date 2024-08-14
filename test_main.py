import asyncio
from aiohttp import web, ClientSession
from aiogram import Bot, Dispatcher, Router, types, F
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from aiogram.filters import CommandStart
from aiohttp.web import Request, json_response
import websockets
import json
from beem import Steem, Hive
from beem.account import Account
from beem.blockchain import Blockchain
from beem.comment import Comment
from beem.community import Communities, Community

TOKEN = "6348055484:AAGhOv6sx5B4acQj-XUfRWV3kJz53FvioWs" #TasuAdmin

bot_id = 1026795763
dp = Dispatcher()

bot = Bot(token=TOKEN)

WEB_SERVER_HOST = "127.0.0.1"

WEB_SERVER_PORT = 5173

WEBHOOK_PATH = r"/webhook"

WEBHOOK_SECRET = "my-secret"

app = "3471-240b-10-5e2-1800-2cac-522d-da1c-3d29.ngrok-free.app"

BASE_WEBHOOK_URL = f"https://{app}"

router = Router()

connected_clients = set()

steem_node = "https://api.moecki.online"
stm = Steem(node=steem_node)
community = Communities(blockchain_instance=stm)

@router.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    keyboard = post_link()
    test_url = 'https://t.me/TasuAdmin_Bot/test_web_app'
    await message.answer(test_url, reply_markup=keyboard)

@router.callback_query(F.data == 'send_data')
async def send_data_handler(callback_query: types.CallbackQuery):
    data_to_send = "Hello from the bot!"
    await bot.answer_callback_query(callback_query.id, text="Data sent!")

    if connected_clients:
        for client in connected_clients:
            await client.send_json(data_to_send)

async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    connected_clients.add(ws)
    try:
        async for msg in ws:
            if msg.type == web.WSMsgType.TEXT:
                # Gestione dei messaggi ricevuti se necessario
                pass
    finally:
        connected_clients.remove(ws)
    
    return ws

async def handle_post(request: Request):
    try:
        data = await request.json()
        userId = data.get('userId')
        title = data.get('title')
        description = data.get('description')
        tag = data.get('tag')
        dateTime = data.get('dateTime')
        
        text = f"Title: {title}, Description: {description}, Tag: {tag}, DateTime: {dateTime}"
        await bot.send_message(userId, text)
        #print(f"user_id: {userId}, Title: {title}, Description: {description}, Tag: {tag}, DateTime: {dateTime}")
        
        return web.json_response({'status': 'success', 'message': 'Dati ricevuti con successo'})
    except Exception as e:
        print(f"Errore durante la gestione della richiesta POST: {e}")
        return web.json_response({'status': 'error', 'message': 'Errore durante la gestione della richiesta POST'}, status=500)

def post_link():
    
    keyboard = []
    keyboard.append([types.InlineKeyboardButton(text="link", web_app=types.WebAppInfo(url=BASE_WEBHOOK_URL))])
    #keyboard.append([types.InlineKeyboardButton(text="test", web_app=types.WebAppInfo(url=test_url))])
    keyboard.append([types.InlineKeyboardButton(text="send_data", callback_data='send_data')])
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=keyboard)
    return keyboard

def get_steem_community(community_name):
    result = community.search_title(community_name)
    return result

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
        # start_server = websockets.serve(send_data, WEB_SERVER_HOST, WEB_SERVER_PORT)
        app.router.add_get('/ws', websocket_handler)
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
