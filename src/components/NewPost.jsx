import React from 'react'
import TextareaAutosize from 'react-textarea-autosize';
import { arweave, contract } from '../lib/api.js';
import { compressAccurately } from 'image-conversion';

export const NewPost = (props) => {
  const [postValue, setPostValue] = React.useState("");
  const [isPosting, setIsPosting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);

  async function onPostButtonClicked() {
    setIsPosting(true);

    const input = {
      function: 'postMessage',
      content: postValue,
      timestamp: Date.now(),
    };

    if (selectedFile) {
      const blob = await compressAccurately(selectedFile, {
        size: 80,
        width: 450
      });
      const fileData = await new Response(blob).arrayBuffer();
      console.log("Uploading " + fileData.byteLength);
      let tx = await arweave.createTransaction({ data: fileData })
      tx.addTag('App-Name', 'SocialApp')
      tx.addTag('Content-Type', 'text/plain')
      tx.addTag('Version', '1.0.0')
      tx.addTag('Type', 'image')
      try {
        const result = await window.arweaveWallet.dispatch(tx);
        console.log("Uploaded " + result.id);
        input.image = result.id;
      } catch (err) {
        console.error(err);
      }
    }

    try {
      // `interactWrite` will return the transaction ID.
      await contract.connect('use_wallet').writeInteraction(input);
      setPostValue("");
      // setTopicValue("");
      if (props.onPostMessage) {
        props.onPostMessage(0);
      }
    } catch (err) {
      console.error(err);
    }
    setIsPosting(false);
  }

  function onFileChange(event) {
    setSelectedFile(event.target.files[0])
  };

  let isDisabled = postValue === "";

  if (props.isLoggedIn) {
    if (isPosting) {
      return (
        <div className="newPost">
          <div className="newPostScrim" />
          <TextareaAutosize
            value={postValue}
            readOnly={true}
          />
          <div className="newPost-postRow">
          {/* <div className="topic">
              # 
              <input
                type="text" 
                placeholder="topic"
                className="topicInput"
                value={topicValue}
                disabled={true}
              />
            </div> */}
            <div >
              <button 
                className="submitButton"
                disabled={true}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="newPost">
          <TextareaAutosize
            value={postValue}
            onChange={e => setPostValue(e.target.value)}
            rows="1" 
            placeholder="What do you have to say?" 
          />
          <div className="newPost-postRow">
            {/* <div className="topic"
              style={{color: topicValue  && "rgb( 80, 162, 255)" }}
            >
              # 
              <input
                type="text" 
                placeholder="topic"
                className="topicInput"
                value={topicValue}
                onChange={e => onTopicChanged(e)}
              />
            </div> */}
            <div >
              <input type="file" onChange={onFileChange} />
              <button 
                className="submitButton"
                disabled={isDisabled} 
                onClick={onPostButtonClicked}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )
    }
  } else {
    return (<div className="darkRow">Connect your wallet to start quacksting...</div>)
  }
};
