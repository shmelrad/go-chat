package middlewares

import (
	"chat-server/models"

	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const BEARER_PREFIX = "Bearer "
func AuthMiddleware(secretKey string, userService models.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenString string
		if c.Request.Header.Get("Upgrade") == "websocket" {
			tokenString = c.Query("access_token")
		} else {
			tokenString = c.GetHeader("Authorization")
			if len(tokenString) < len(BEARER_PREFIX) {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
				c.Abort()
				return
			}
			tokenString = tokenString[len(BEARER_PREFIX):]	
		}


		// Parse the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, http.ErrAbortHandler
			}
			return []byte(secretKey), nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort() // Stop further processing if unauthorized
			return
		}
		// Set user to the context
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			userId := uint(claims["sub"].(float64))
			user, err := userService.GetUserById(userId)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
				c.Abort()
				return
			}
			c.Set("user", user)
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		c.Next() // Proceed to the next handler if authorized
	}
}
