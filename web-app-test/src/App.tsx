import React from 'react';
import './App.css'
import { Telegram } from "@twa-dev/types";
//import { formatText } from './format/FormatText';

declare global {
  interface Window {
    Telegram: Telegram;
  }
}

const BASE_URL = '95de-240b-10-5e2-1800-c4e2-7f30-2b43-e752.ngrok-free.app';

function App() {
  const [titolo, setTitolo] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [tag, setTag] = React.useState('steemit steemexclusive');
  const [dateTime, setDateTime] = React.useState('');
  const [userId, setUserId] = React.useState<number | null>(null);
  // const [showContextMenu, setShowContextMenu] = useState(false);
  // const [initData, setInitData] = useState('');

  const inviaMessaggio = async (): Promise<void> => {
      const headers = {
          "accept": "application/json",
          "authorization": "Bearer my-secret",
          "Content-Type": "application/json"
      };

      const post = {
          title: titolo,
          description: description,
          tag: tag,
          dateTime: dateTime,
          userId: userId
      };

      try {
          const response = await fetch(`https://${BASE_URL}/post`, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify(post)
          });

          if (!response.ok) {
              throw new Error('Errore durante l\'invio del messaggio');
          }

          window.Telegram.WebApp.showPopup({
              title: "Messaggio Inviato",
              message: "Il tuo messaggio è stato inviato con successo!",
              buttons: [{ type: 'ok' }]
          });
      } catch (error) {
          window.Telegram.WebApp.showPopup({
              title: "Errore",
              message: "Si è verificato un errore durante l'invio del messaggio.",
              buttons: [{ type: 'ok' }]
          });
          console.error('Errore durante l\'invio del messaggio:', error);
      }
  };
  const getUserInfo = () => {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    if (user) {
        setUserId(user.id);
    }
};

React.useEffect(() => {
    getUserInfo();
}, []);

React.useEffect(() => {
  const savedTags = localStorage.getItem('tags');
  if (savedTags) {
    setTag(savedTags);
  }
  const savedTitle = localStorage.getItem('title');
  if (savedTitle) {
      setTitolo(savedTitle);
  }
  const savedDescription = localStorage.getItem('description');
  if (savedDescription) {
      setDescription(savedDescription);
  }
  const savedDateTime = localStorage.getItem('dateTime');
    if (savedDateTime) {
      setDateTime(savedDateTime);
  }
}, []);
  
React.useEffect(() => {
    localStorage.setItem('title', titolo);
}, [titolo]);

React.useEffect(() => {
    localStorage.setItem('description', description);
}, [description]);
  
React.useEffect(() => {
  localStorage.setItem('tags', tag);
}, [tag]);

  return (
    <>
      <div className="container">
      {/* Casella della community
      <input
        type="text"
        placeholder={initData}
        className="input-community"
        value={initData}
        onChange={(e) => setInitData(e.target.value)}
      /> */}
      {/* Casella di input per il titolo */}
      <input
        type="text"
        placeholder="Title"
        className="input-title"
        value={titolo}
        onChange={(e) => setTitolo(e.target.value)}
      />
      {/* Casella di input per la descrizione */}
      <textarea
        placeholder="body of post"
        className="input-description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        // onFocus={() => setShowFormatOptions(true)}
        // onBlur={() => setShowFormatOptions(false)}
        maxLength={15000}
      />
      {/* {showFormatOptions && (
          <div className="format-options">
            <button onClick={() => formatSelectedText('bold')}>Bold</button>
            <button onClick={() => formatSelectedText('italic')}>Italic</button>
            <button onClick={() => formatSelectedText('code')}>Code</button>
          </div>
      )} */}
      {/* Casella di input per i tag */}
      <input
        type="text"
        placeholder="Tag exaple: steem steemit steemexclusive"
        className="input-tag"
        value={tag}
        onChange={(e) => {
          const inputWords = e.target.value.split(' ');
          if (inputWords.length <= 7) {
            setTag(e.target.value);
          }
        }}
      />
      <input 
        type="datetime-local" 
        className="input-datetime" 
        value={dateTime} 
        onChange={(e) => setDateTime(e.target.value)} 
      />
      {/* Bottone di invio post */}
      <button className="button" onClick={inviaMessaggio}>Send Post</button>
    </div>
    </>
  )
}

export default App
