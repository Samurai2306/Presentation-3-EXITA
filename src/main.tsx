import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import YaZhivoyApp from './YaZhivoyApp'
import './styles/well-tokens.css'
import './styles/well-theme-presets.css'
import './styles/well-components.css'
import './styles/well-layout.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <YaZhivoyApp />
  </StrictMode>,
)
