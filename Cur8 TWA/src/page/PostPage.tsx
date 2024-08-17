// PostPage.tsx
// import React from 'react';
// import { CommunitySelector } from './components/CommunitySelector';
import { PostForm } from './components/PostForm';
import { ImageUploader } from './components/ImageUploader';
import { usePostSubmission } from './hooks/usePostSubmission';
// import { useCommunitySearch } from './hooks/useCommunitySearch';
// import { useWebSocket } from './hooks/useWebSocket';
import { UserProvider } from './contexts/UserContext';

function PostingPage() {
  const { submitPost } = usePostSubmission();
  // const { communities, searchCommunity } = useCommunitySearch();
  // useWebSocket();

  return (
    <UserProvider>
      <div className="container">
        {/* <CommunitySelector 
          communities={communities} 
          onSelect={searchCommunity} 
        /> */}
        <PostForm onSubmit={submitPost} />
        <ImageUploader />
      </div>
    </UserProvider>
  );
}

export default PostingPage;
