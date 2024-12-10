import app from "./app"
import env from "./util/validateEnv"
import mongoose from "mongoose";

const port = env.PORT || 8081;
mongoose.connect(env.MONGOOSE_CONNECTION_STRING)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log('Server is running on port :' + port);
        })
    })
    .catch((err) => {
        console.log("failed to connect to MongoDB: " + err)
    })




