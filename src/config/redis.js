const redis = require("redis");

const {
  REDIS_CONNECT_MESSAGE,
  REDIS_CONNECT_TIMEOUT,
  STATUS_CONNECT_REDIS,
} = require("../constants/redis");

let connectTimeout;
let instanceRedis;

const handleErrorsTimeout = () => {
  connectTimeout = setTimeout(() => {
    throw new Error(REDIS_CONNECT_MESSAGE.message.vi);
  }, REDIS_CONNECT_TIMEOUT);
};

const handleEventConnection = (connectionRedis) => {
  connectionRedis.on(STATUS_CONNECT_REDIS.CONNECTED, function () {
    console.log("Redis connected");
    clearTimeout(connectTimeout);
  });

  connectionRedis.on(STATUS_CONNECT_REDIS.END, function () {
    console.log("Redis connection ended");
    handleErrorsTimeout();
  });

  connectionRedis.on(STATUS_CONNECT_REDIS.RECONNECT, function () {
    console.log("Redis reconnecting...");
    clearTimeout(connectTimeout);
  });

  connectionRedis.on(STATUS_CONNECT_REDIS.ERROR, function (error) {
    console.log("Redis error: ", error);
    handleErrorsTimeout();
  });
};

const initRedis = async () => {
  if (instanceRedis) {
    console.log("Redis is already connect");
    return instanceRedis;
  }

  instanceRedis = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
      tls: true,
    },
  });

  handleEventConnection(instanceRedis);

  try {
    await instanceRedis.connect();
    console.log("Redis connect successfully");
  } catch (error) {
    console.log("Redis connect failed", error);
    throw new Error("Redis connect failed");
  }

  return instanceRedis;
};

const closeRedis = async () => {
  if (instanceRedis) {
    try {
      await instanceRedis.quit();
      console.log("Redis connection closed.");
    } catch (err) {
      console.error("Error closing Redis connection:", err);
    }
  }
};

module.exports = {
  initRedis,
  closeRedis,
};
