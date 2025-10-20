import { app } from './app.ts'
import { env } from './env/index.ts'


app.listen({ 
  host: '0.0.0.0',
  port: env.PORT
 }).then(() => {
  console.log(`Server is running on http://localhost:${env.PORT}`)
})
