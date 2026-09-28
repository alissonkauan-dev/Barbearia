import fastify from "fastify";
import prisma from "./database/prisma";
import fastifyCookie from '@fastify/cookie';
import { env } from "./env";
import { userRoutes } from "./modules/User/usuarioRoutes";



const app = fastify();


app.register(fastifyCookie, {
    secret: env.COOKIES_SECRET,
})


const API = "/api/v1"

app.register(userRoutes,{
    prefix: `${API}/usuario`
})



export default app;