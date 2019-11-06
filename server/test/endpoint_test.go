package test

import (
	"github.com/google/go-cmp/cmp"
	"github.com/google/uuid"
	"net/http"
	"reflect"
	"strings"
	"testing"
	"time"
)

func TestPostPioneerHandler_AfterPostCanGetInformationFromGet(t *testing.T) {
	pioneerToPOST := map[string]string{"name": "Alice", "id": uuid.New().String()}

	if err := performPostPioneer(pioneerToPOST); err != nil {
		t.Errorf("Post Pioneer Request failed. %v", err)
		return
	}

	pioneerRecords, err := performGetPioneerRequest()
	if err != nil {
		t.Errorf("Get Pioneer Request failed. %v", err)
		return
	}

	if !jsonArrayContains(pioneerRecords, pioneerToPOST) {
		t.Errorf("Slice %v\n did not contain: %v", pioneerRecords, pioneerToPOST)
	}
}

func TestPutCorral_AfterPutCanGetCorral(t *testing.T) {
	pioneer := map[string]interface{}{"name": "Alice", "id": uuid.New().String()}
	chore := map[string]interface{}{
		"name":        "Compiled Cans",
		"id":          uuid.New().String(),
		"description": "Bruce knows how to can can",
		"title":       "Canner",
	}
	date := "11-11-11"

	corral := map[string]interface{}{
		"date":     date,
		"pioneers": []interface{}{pioneer},
		"chores":   []interface{}{chore},
	}

	if err := performPutCorral(corral); err != nil {
		t.Errorf("Post Corral Request failed. %v", err)
		return
	}

	resultCorral, err := performGetCorralRequest(date)
	if err != nil {
		t.Errorf("Get Corral Request failed. %v", err)
		return
	}

	assertCorralsEqual(corral, *resultCorral, t)
}

func TestPutCorralMultipleTimes_GetWillReturnTheLatest(t *testing.T) {
	date := "11-11-11"
	corral := map[string]interface{}{
		"date":     date,
		"pioneers": []interface{}{},
		"chores":   []interface{}{},
	}
	if err := performPutCorral(corral); err != nil {
		t.Errorf("Post Corral Request failed. %v", err)
		return
	}

	time.Sleep(1 * time.Millisecond)
	updatedCorral := map[string]interface{}{
		"date":     date,
		"pioneers": []interface{}{map[string]interface{}{"name": "Rose", "id": uuid.New().String()}},
		"chores":   []interface{}{},
	}
	if err := performPutCorral(updatedCorral); err != nil {
		t.Errorf("Post Corral Request failed. %v", err)
		return
	}

	resultCorral, err := performGetCorralRequest(date)
	if err != nil {
		t.Errorf("Get Corral Request failed. %v", err)
		return
	}

	assertCorralsEqual(updatedCorral, *resultCorral, t)
}

func assertCorralsEqual(expected map[string]interface{}, actual map[string]interface{}, t *testing.T) {
	if !cmp.Equal(expected, actual) {
		t.Errorf("Returned expected was not equal:\n%v", cmp.Diff(expected, actual))
	}
}

func TestGetPioneerById(t *testing.T) {
	pioneerToPOST := map[string]string{"name": "Dewy Dooter", "id": uuid.New().String()}

	if err := performPostPioneer(pioneerToPOST); err != nil {
		t.Errorf("Post Pioneer Request failed. %v", err)
		return
	}

	pioneerRecords, err := performGetPioneerById(pioneerToPOST["id"])
	if err != nil {
		t.Errorf("Get Pioneer Request failed. %v", err)
		return
	}

	if !reflect.DeepEqual(pioneerRecords, pioneerToPOST) {
		t.Errorf("Slice %v\n did not contain: %v", pioneerRecords, pioneerToPOST)
	}
}

func TestPostChore_WillWorkWithGetChore(t *testing.T) {
	chore := map[string]string{
		"name":        "Compiled Cans",
		"id":          uuid.New().String(),
		"description": "Bruce knows how to can can",
		"title":       "Canner",
	}
	if err := performPostChore(chore); err != nil {
		t.Errorf("Post Chore Request failed. %v", err)
		return
	}
	responseJson, err := performGetChores()
	if err != nil {
		t.Errorf("Get Chore Request failed. %v", err)
		return
	}
	if !jsonArrayContains(responseJson, chore) {
		t.Errorf("List %v, did not contain %v", responseJson, chore)
	}
}

func TestIndexHtmlIsReturnedFromRandomPaths(t *testing.T) {
	responseRecorder, err := performRequest(http.MethodGet, "/random/thing/not/a/real/path", nil)
	if err != nil {
		t.Errorf("Got an error on http request. %v", err)
		return
	}

	if err := verifySuccessfulRequest(responseRecorder); err != nil {
		t.Errorf("Result was not successful. %v", err)
	}

	bodyString := responseRecorder.Body.String()

	if !strings.Contains(bodyString, "<title>Chore Wheel</title>") {
		t.Errorf("Result was not the index page. %v", err)
	}
}

func TestRealPathsStillReturnContent(t *testing.T) {
	responseRecorder, err := performRequest(http.MethodGet, "/build/index.css", nil)
	if err != nil {
		t.Errorf("Got an error on http request. %v", err)
		return
	}

	if err := verifySuccessfulRequest(responseRecorder); err != nil {
		t.Errorf("Result was not successful. %v", err)
	}

	bodyString := responseRecorder.Body.String()

	if strings.Contains(bodyString, "<title>Chore Wheel</title>") {
		t.Errorf("Result was the index page... and it shouldn 't be! %v", err)
	}
}
