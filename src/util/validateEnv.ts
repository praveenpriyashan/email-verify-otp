import {cleanEnv,port,str} from "envalid";

export default cleanEnv(process.env,{
    MONGOOSE_CONNECTION_STRING:str(),
    PORT:port(),
})