import React from 'react';
import './LoginPage.css'
import { Telegram } from "@twa-dev/types";
import { URL } from './setup/config';

declare global {
  interface Window {
    Telegram: Telegram;
  }
}

function LoginPage() {
  const [account, setAccount] = React.useState('');
  const [wif, setWif] = React.useState('');
  const [userId, setUserId] = React.useState<number | null>(null);
  // const [initData, setInitData] = useState('');

  const getUserInfo = () => {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    if (user) {
        setUserId(user.id);
    }
  };

  const inviaMessaggio = async (): Promise<void> => {
    const headers = {
        "accept": "application/json",
        "authorization": "Bearer my-secret",
        "Content-Type": "application/json"
    };

    const post = {
      userId: userId,
      account: account,
      wif: wif
    };

    try {
        const response = await fetch(`${URL}/login`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(post)
        });

        if (!response.ok) {
            throw new Error('Errore durante l\'invio del messaggio');
        }

        window.Telegram.WebApp.showPopup({
            title: "Login effettuato",
            message: `Login effettuato con successo!`,
            buttons: [{ type: 'ok' }]
        });
        window.location.reload();
    } catch (error) {
        window.Telegram.WebApp.showPopup({
            title: "Errore",
            message: `Si è verificato un errore durante l'invio del messaggio ${error}`,
            buttons: [{ type: 'ok' }]
        });
        console.error('Errore durante l\'invio del messaggio:', error);
    }
};

React.useEffect(() => {
  getUserInfo();
}, []);

  return (
    <>
      <div className="container">
      <input
        type="text"
        placeholder="Write here account"
        className="input-account"
        value={account}
        onChange={(e) => setAccount(e.target.value)}
      />
      <input
        type="password"
        placeholder="Write here your posting key"
        className="input-wif"
        value={wif}
        onChange={(e) => setWif(e.target.value)}
      />
      {/* Bottone di invio post */}
      <button className="button" onClick={inviaMessaggio}>Login</button>
    </div>
    </>
  )
}

export default LoginPage