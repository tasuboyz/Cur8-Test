import React, { ChangeEvent } from 'react';
import './PostPage.css'
import { Telegram } from "@twa-dev/types";
import { SOCKET_URL, URL } from './setup/config';

declare global {
  interface Window {
    Telegram: Telegram;
  }
}

function PostingPage() {
  const [titolo, setTitolo] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [tag, setTag] = React.useState('steemit steemexclusive');
  const [dateTime, setDateTime] = React.useState('');
  const [userId, setUserId] = React.useState<number | null>(null);
  //const [webSocketData, setWebSocketData] = React.useState([]);
  const [communities, setCommunities] = React.useState<Array<{id: string, name: string}>>([]);
  const [filteredCommunities, setFilteredCommunities] = React.useState<Array<{id: string, name: string}>>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCommunity, setSelectedCommunity] = React.useState<{id: string, name: string} | null>(null);
  const [showCommunityList, setShowCommunityList] = React.useState(false);

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
          const response = await fetch(`${URL}/post`, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify(post)
          });

          if (!response.ok) {
              throw new Error('Errore durante l\'invio del messaggio');
          }

          window.Telegram.WebApp.showPopup({
              title: "Messaggio Inviato",
              message: `Il tuo messaggio è stato inviato con successo!`,
              buttons: [{ type: 'ok' }]
          });
      } catch (error) {
          window.Telegram.WebApp.showPopup({
              title: "Errore",
              message: `Si è verificato un errore durante l'invio del messaggio ${error}`,
              buttons: [{ type: 'ok' }]
          });
          console.error('Errore durante l\'invio del messaggio:', error);
      }
  };
  
  const SearchCommunity = async (communityId: string): Promise<void> => {
    const headers = {
        "accept": "application/json",
        "authorization": "Bearer my-secret",
        "Content-Type": "application/json"
    };

    const post = {
      community: `${communityId}`
    };

    try {
        const response = await fetch(`${URL}/community`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(post)
        });

        if (!response.ok) {
            throw new Error('Errore durante l\'invio del messaggio');
        }
        const data = await response.json(); 
        // const jsonString = JSON.stringify(data);
        // const stringWithoutQuotes = jsonString.replace(/"/g, '');
        const parsedCommunities = data.map((item: string) => {
          const [id, name] = item.split(',');
          return { id, name };
        });
        window.Telegram.WebApp.showPopup({
            title: "Messaggio Inviato",
            message: `${parsedCommunities}`,
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

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const imageBase64 = reader.result as string;
            handleSubmit(imageBase64);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (imageBase64: string) => {
    const headers = {
      "accept": "application/json",
      "authorization": "Bearer my-secret",
      "Content-Type": "application/json"
    };
    const body = JSON.stringify({ 
      userId: userId,
      image: imageBase64
    });
    try {
      const response = await fetch(`${URL}/image`, {
        method: 'POST',
        headers: headers,
        body: body
      });
      if (!response.ok) {
        throw new Error('Errore durante l\'invio dell\'immagine');
      }
      const data = await response.json(); 
      const jsonString = JSON.stringify(data);
      const stringWithoutQuotes = jsonString.replace(/"/g, '');
      setDescription(prevDescription => prevDescription + '\n' + stringWithoutQuotes);
      // window.Telegram.WebApp.showPopup({
      //   title: "Messaggio Inviato",
      //   message: `Immagine inviata con successo! Dato restituito: ${JSON.stringify(data)}`,
      //   buttons: [{ type: 'ok' }]
      // });
    } catch (error) {
      console.error('Errore durante l\'invio dell\'immagine:', error);
    }
  };  

React.useEffect(() => {
    getUserInfo();
}, []);

React.useEffect(() => {
  const socket = new WebSocket(SOCKET_URL);

  socket.onopen = () => {
    // window.Telegram.WebApp.showPopup({
    //   title: "Connessione Stabilita",
    //   message: "La connessione WebSocket è stata stabilita con successo!",
    //   buttons: [{ type: 'ok' }]
    // });
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const parsedCommunities = data.map((item: string) => {
        const [id, name] = item.split(',');
        return { id, name };
      });
      setCommunities(parsedCommunities);
      setFilteredCommunities(parsedCommunities);
    } catch (error) {
      console.error('Errore nel parsing del messaggio:', error);
    }
  };

  socket.onerror = (error) => {
    window.Telegram.WebApp.showPopup({
      title: "Errore WebSocket",
      message: `Si è verificato un errore: ${error}`,
      buttons: [{ type: 'ok' }]
    });
  };

  socket.onclose = () => {
    window.Telegram.WebApp.showPopup({
      title: "Connessione Chiusa",
      message: "La connessione WebSocket è stata chiusa.",
      buttons: [{ type: 'ok' }]
    });
  };

  return () => {
    socket.close();
  };
}, []);

// const scrollList = () => {
//   const listElement = document.getElementById('list');
//   if (listElement) {
//     listElement.scrollBy(0, 100); // Scorre di 100px
//   }
// };

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
  const filtered = communities.filter(community => 
    community.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  setFilteredCommunities(filtered);
}, [searchTerm, communities]);

const handleCommunitySelect = (community: {id: string, name: string}) => {
  setSelectedCommunity(community);
  SearchCommunity(community.id);
  setShowCommunityList(false);
};

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
  <div className="container">
    <div className="community-section">
      <input
        type="text"
        placeholder="Cerca community..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="community-search"
        onFocus={() => setShowCommunityList(true)} // Mostra la lista quando la casella è in focus
      />
      <i
        className="fas fa-chevron-down"
        onClick={() => setShowCommunityList(!showCommunityList)} // Alterna la visibilità della lista
      ></i>
      {showCommunityList && (
        <div className="community-list">
          {filteredCommunities.map((community) => (
            <div
              key={community.id}
              className={`community-item ${selectedCommunity?.id === community.id ? 'selected' : ''}`}
              onClick={() => handleCommunitySelect(community)}
            >
              {community.name}
            </div>
          ))}
        </div>
      )}
    </div>
    <input
      type="text"
      placeholder="Title"
      className="input-title"
      value={titolo}
      onChange={(e) => setTitolo(e.target.value)}
    />
    <textarea
      placeholder="body of post"
      className="input-description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      maxLength={15000}
    />
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
    <input type="file" onChange={handleImageChange} />
    <button className="button" onClick={inviaMessaggio}>Send Post</button>
  </div>
);
}

export default PostingPage;