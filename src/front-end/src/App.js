import React, {useEffect} from 'react';
import './App.css';
import i18n from "./translations"
import {loadLanguageFromLocalstorage} from "./redux/dispatchers"
import {useDispatch, useSelector } from "react-redux"
import {AppRouter} from "./routes"

function App() {
  const language = useSelector( state=> state.language )
  const dispatch = useDispatch()
  
  useEffect(() => {
    loadLanguageFromLocalstorage(language, dispatch)
    i18n.changeLanguage(language)
  }, [dispatch, language])

  return (
    <AppRouter></AppRouter>
  );
}

export default App;
