import React, { useEffect, useState } from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import ShowNewToast from './MyComponents/ShowNewToast';

const CopyTextButton = ({ textToCopy, children }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  useEffect(() => {
    if (copied) {
      ShowNewToast("Link Copied", "Link copied to clipboard.")
    }
  }, [copied]);

  return (
    <CopyToClipboard text={textToCopy} onCopy={onCopy}>
      <button>{children ? children : 'Copy'}</button>
    </CopyToClipboard>
  );
};

export default CopyTextButton;