import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { postAPI } from '../api/postAPI';

export function usePostSubmission() {
  const [post, setPost] = useState({ title: '', description: '', tag: '', dateTime: '' });
  const { userId } = useUser();

  const submitPost = async () => {
    try {
      await postAPI.submit({ ...post, userId });
      // Gestione del successo
    } catch (error) {
      // Gestione dell'errore
    }
  };

  return { post, setPost, submitPost };
}