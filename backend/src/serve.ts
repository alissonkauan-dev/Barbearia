import {env} from "./env";
import app from "./app";

const start = async () => {

    try {
        await app.listen({port: env.PORT, host: env.HOST})
        .then(() => console.log(`Server is running on http://${env.HOST}:${env.PORT}`));
    }

    catch (err) {

        console.error(err);

    }
}

start();