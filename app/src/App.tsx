import './index.css'
import './App.css'
import { config } from './config'

function App() {
  return (
    <div className="container">
      <h1>CDK React Nestjs Full Stack Boilerplate</h1>
      <h3>{config.buildDate}</h3>

      <div>
        <span>Swagger - </span>
        <a href={`${config.api}/swagger`}>{config.api}/swagger</a>
      </div>

      <div>
        <span>API - </span>
        <a href={`${config.api}/settings`}>{config.api}/settings</a>
      </div>

      <div>
        <span>Health - </span>
        <a href={`${config.api}/health`}>{config.api}/health</a>
      </div>
      <h3 style={{ color: 'red' }}>Warning, running on AWS is powerfull but expensive</h3>
    </div>
  )
}

export default App
