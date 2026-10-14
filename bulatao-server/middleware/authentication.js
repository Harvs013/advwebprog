const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { HttpStatus } = require("../config/constant.js");

module.exports = async (request, response, next) => {
  try {
    // get the token from the authorization header
    const token = request.headers.authorization && request.headers.authorization.split(" ")[1];

    if (!token) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        error: "Invalid Request!",
      });
    }

    // check if the token matches the supposed origin
    const decodedToken = jwt.verify(token, SECRET_KEY);

    // retrieve the user details of the logged in user
    const user = decodedToken;

    // pass the user down to the endpoints here
    request.user = user;

    // pass down functionality to the endpoint
    next();
  } catch (error) {
    response.status(HttpStatus.UNAUTHORIZED).json({
      error: "Invalid request!",
    });
  }
};