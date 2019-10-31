package internal

import (
	"context"
	"encoding/json"
	"fmt"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
	"net/http"
)

var ServeMux = initializeMux()
var ClientPath = "../client/build"

func initializeMux() http.Handler {
	client, err := getDBClient()
	if err != nil {
		log.Fatal(err)
		return nil
	}

	mux := http.NewServeMux()
	mux.Handle("/build/", http.StripPrefix("/build", buildDirectoryHandler()))

	hc := handlerContext{dbClient: client}

	mux.Handle("/api/", http.StripPrefix("/api", apiMux(hc)))

	mux.Handle("/", indexHtmlHandler())

	return mux
}

func buildDirectoryHandler() http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		http.FileServer(http.Dir(ClientPath)).ServeHTTP(writer, request)
	})
}

func indexHtmlHandler() http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		http.ServeFile(writer, request, fmt.Sprintf("%v/index.html", ClientPath))
	})
}

func apiMux(hc handlerContext) *http.ServeMux {
	apiMux := http.NewServeMux()
	apiMux.Handle("/pioneer", hc.methodRoute(pioneerHandler))
	apiMux.Handle("/chore", hc.methodRoute(choreMethodRoute))
	return apiMux
}

func getDBClient() (*mongo.Client, error) {
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	client, err := mongo.Connect(context.Background(), clientOptions)

	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	err = client.Ping(context.Background(), nil)

	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	return client, nil
}

func writeAsJson(writer http.ResponseWriter, jsonStruct interface{}) error {
	writer.Header().Set("Content-Type", "application/json")
	choreRows, err := json.Marshal(jsonStruct)
	if err != nil {
		return err
	}
	_, err = writer.Write(choreRows)
	return err
}
