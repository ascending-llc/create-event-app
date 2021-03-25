import React from 'react';
import './App.css';
import { AppBar, Button } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';

function App() {
  const matches = useMediaQuery('(min-width:600px)');
  return (
    <div className="">
      <AppBar position="static">
        {matches ? (
          <Button>B</Button>
        ) : (
          <div>
            <Button>Hellp</Button>
            <Button>world</Button>
            <Button>sure</Button>
          </div>
        )}
      </AppBar>
    </div>
  );
}

export default App;
