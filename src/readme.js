import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './css/App.css';

function Readme({ file }) {
  const [readme, setReadme] = useState('');

  useEffect(() => {
    const filePath = process.env.PUBLIC_URL + `/${file}`;
    axios.get(filePath)
      .then(response => {
        setReadme(response.data);
      });
  }, [file]);

  return (
    <div className='readme'>
      <ReactMarkdown children={readme} />
    </div>
  );
}

export default Readme;