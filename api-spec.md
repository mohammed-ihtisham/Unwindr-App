# API Specification: UserAuth Concept

**Purpose:** authenticate users and manage moderator privileges

---

## API Endpoints

### POST /api/UserAuth/registerUser

**Description:** Registers a new user with the provided username and password.

**Requirements:**
- username unique and password non-empty

**Effects:**
- creates a new user with default permissions (cannot moderate); returns userId on success or an Error on failure (e.g., username taken).

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "userId": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuth/login

**Description:** Creates a new active session and returns a new unique sessionToken on success.

**Requirements:**
- username exists and password matches

**Effects:**
- creates a new active session, returns a new unique sessionToken on success. Returns an Error (e.g., "Invalid credentials") on failure.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "sessionToken": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuth/logout

**Description:** Removes the sessionToken from activeSessions.

**Requirements:**
- sessionToken exists in activeSessions

**Effects:**
- removes the sessionToken from activeSessions, returns true on success, false otherwise.

**Request Body:**
```json
{
  "sessionToken": "string"
}
```

**Success Response Body (Action):**
```json
{
  "success": "boolean"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuth/getAuthenticatedUser

**Description:** Returns a subset of user information for the authenticated user, or null if sessionToken is invalid.

**Requirements:**
- sessionToken is valid and exists in activeSessions

**Effects:**
- returns a subset of user information for the authenticated user, or null if sessionToken is invalid.

**Request Body:**
```json
{
  "sessionToken": "string"
}
```

**Success Response Body (Action):**
```json
{
  "userProfile": {
    "userId": "string",
    "username": "string",
    "canModerate": "boolean"
  }
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuth/changePassword

**Description:** Updates the passwordHash for the authenticated user and invalidates existing sessionTokens.

**Requirements:**
- sessionToken is valid and linked to a user, oldPassword matches the user's current passwordHash, and newPassword is non-empty.

**Effects:**
- updates the passwordHash for the authenticated user, invalidates existing sessionTokens, returns true on success, or an Error on failure.

**Request Body:**
```json
{
  "sessionToken": "string",
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Success Response Body (Action):**
```json
{
  "success": "boolean"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuth/grantModerator

**Description:** Sets canModerate to true for targetUser.

**Requirements:**
- adminSessionToken is valid and linked to a user whose canModerate is true, and targetUserId exists.

**Effects:**
- sets canModerate to true for targetUser, returns true on success, or an Error on failure.

**Request Body:**
```json
{
  "targetUserId": "string",
  "adminSessionToken": "string"
}
```

**Success Response Body (Action):**
```json
{
  "success": "boolean"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuth/revokeModerator

**Description:** Sets canModerate to false for targetUser.

**Requirements:**
- adminSessionToken is valid and linked to a user whose canModerate is true, and targetUserId exists.

**Effects:**
- sets canModerate to false for targetUser, returns true on success, or an Error on failure.

**Request Body:**
```json
{
  "targetUserId": "string",
  "adminSessionToken": "string"
}
```

**Success Response Body (Action):**
```json
{
  "success": "boolean"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuth/_getUserDetails

**Description:** Returns a user's username and moderation status.

**Requirements:**
- userId exists

**Effects:**
- returns user's username and moderation status
- Note: This is a query, so it returns an array of results.

**Request Body:**
```json
{
  "userId": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "user": {
      "username": "string",
      "canModerate": "boolean"
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuth/_isModerator

**Description:** Returns true if user can moderate, false otherwise.

**Requirements:**
- userId exists

**Effects:**
- returns true if user can moderate, false otherwise
- Note: This is a query, so it returns an array of results.

**Request Body:**
```json
{
  "userId": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "isModerator": "boolean"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

# API Specification: PlaceCatalog Concept

**Purpose:** Support the discovery, management, and verification of geographical places for users.

---

## API Endpoints

### POST /api/PlaceCatalog/seedPlaces

**Description:** loads places from provider within specified area.

**Requirements:**
- coordinates are valid and radius > 0

**Effects:**
- loads places from provider within specified area.
- (For this implementation, it adds a few dummy places if none exist, to simulate seeding from a provider.)

**Request Body:**
```json
{}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlaceCatalog/bulkImportOSMPlaces

**Description:** imports places from OSM data file.

**Requirements:**
- osmDataPath is valid file path

**Effects:**
- imports places from OSM data file into the database.

**Request Body:**
```json
{
  "osmDataPath": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlaceCatalog/checkAreaCoverage

**Description:** checks if an area has sufficient place coverage.

**Requirements:**
- coordinates are valid and radius > 0

**Effects:**
- returns coverage information for the specified area.

**Request Body:**
```json
{
  "centerLat": "number",
  "centerLng": "number",
  "radius": "number"
}
```

**Success Response Body (Action):**
```json
{
  "hasCoverage": "boolean",
  "placeCount": "number"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlaceCatalog/addPlace

**Description:** creates a new user-added place and returns its ID.

**Requirements:**
- user is authenticated (assumed here)
- name is not empty
- coordinates are valid

**Effects:**
- creates a new user-added place and returns its ID.

**Request Body:**
```json
{
  "userId": "ID",
  "name": "string",
  "address": "string",
  "category": "string",
  "lat": "number",
  "lng": "number"
}
```

**Success Response Body (Action):**
```json
{
  "placeId": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlaceCatalog/setPlaceVerificationStatus

**Description:** sets the verification status of the place (true for verified, false for unverified/deactivated).

**Requirements:**
- user has moderation privileges and place exists

**Effects:**
- sets the verification status of the place (true for verified, false for unverified/deactivated).

**Request Body:**
```json
{
  "placeId": "ID",
  "moderatorId": "ID",
  "isVerified": "boolean"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlaceCatalog/updatePlace

**Description:** updates the name and address of the specified place.

**Requirements:**
- place exists and user is authenticated (assumed here)
- (Further restrictions, e.g., only `addedBy` user can update, would be in syncs)

**Effects:**
- updates the name and address of the specified place.

**Request Body:**
```json
{
  "placeId": "ID",
  "name": "string",
  "address": "string",
  "userId": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlaceCatalog/_getPlacesInArea

**Description:** returns an array of IDs of places found within the specified circular area.

**Requirements:**
- coordinates are valid and radius > 0

**Effects:**
- returns an array of IDs of places found within the specified circular area.
- The radius is in kilometers.

**Request Body:**
```json
{
  "centerLat": "number",
  "centerLng": "number",
  "radius": "number"
}
```

**Success Response Body (Query):**
```json
[
  {
    "places": [
      "ID",
      "ID"
    ]
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlaceCatalog/_getPlaceDetails

**Description:** returns the full details of the specified place.

**Requirements:**
- place exists

**Effects:**
- returns the full details of the specified place.

**Request Body:**
```json
{
  "placeId": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "place": {
      "id": "ID",
      "name": "string",
      "address": "string",
      "category": "string",
      "verified": "boolean",
      "addedBy": "ID",
      "location": {
        "type": "Point",
        "coordinates": [
          "number",
          "number"
        ]
      },
      "source": "provider"
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

# API Specification: MediaLibrary Concept

**Purpose:** store and retrieve media items for visual discovery

---

## API Endpoints

### POST /api/MediaLibrary/seedMedia

**Description:** Inserts a batch of media items provided by an external source for a specific place.

**Requirements:**
- urls not empty
- placeId provided

**Effects:**
- inserts provider-sourced media items

**Request Body:**
```json
{
  "placeId": "string",
  "urls": "string[]"
}
```

**Success Response Body (Action):**
```json
{
  "count": "number"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/MediaLibrary/addMedia

**Description:** Adds a single media item contributed by a user for a specific place.

**Requirements:**
- userId valid
- imageUrl non-empty
- placeId provided

**Effects:**
- adds user-contributed media

**Request Body:**
```json
{
  "userId": "string",
  "placeId": "string",
  "imageUrl": "string"
}
```

**Success Response Body (Action):**
```json
{
  "mediaId": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/MediaLibrary/deleteMedia

**Description:** Removes a media item if it exists and the user ID matches the contributor ID.

**Requirements:**
- mediaId exists
- userId matches contributorId of mediaId

**Effects:**
- removes media item from the set

**Request Body:**
```json
{
  "userId": "string",
  "mediaId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "success": "boolean"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/MediaLibrary/_getMediaByPlace

**Description:** Retrieves all media item IDs associated with a specific place, ordered by their creation date in descending order.

**Requirements:**
- placeId provided

**Effects:**
- returns media item IDs ordered by createdAt desc

**Request Body:**
```json
{
  "placeId": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "mediaIds": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/MediaLibrary/getMediaItemsByPlace

**Description:** Retrieves all media items associated with a specific place with their full data including image URLs, ordered by their creation date in descending order.

**Requirements:**
- placeId provided

**Effects:**
- returns full media items with image URLs ordered by createdAt desc

**Request Body:**
```json
{
  "placeId": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "string",
    "placeId": "string",
    "contributorId": "string | null",
    "createdAt": "string (ISO date)",
    "imageUrl": "string",
    "source": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: MediaAnalytics Concept

**Purpose:** record and compute engagement scores for media items

---

## API Endpoints

### POST /api/MediaAnalytics/recordInteraction

**Description:** Records a user's interaction with a media item and updates its engagement score.

**Requirements:**
- interactionType of interaction is valid

**Effects:**
- logs interaction and increments engagement score by weight(interactionType)

**Request Body:**
```json
{
  "userId": "ID",
  "mediaItemId": "ID",
  "interactionType": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/MediaAnalytics/_getEngagement

**Description:** Retrieves the current engagement score for a specific media item.

**Requirements:**
- mediaItemId provided is valid (interpreted as a non-empty string ID)

**Effects:**
- returns engagement score or 0 (if no engagement data is found for the item)

**Request Body:**
```json
{
  "mediaItemId": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "score": "number"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/MediaAnalytics/recomputeScoresForPlace

**Description:** Recalculates engagement scores for a given set of media items based on all historical interactions.

**Requirements:**
- placeId (contextual identifier) and mediaItemIds (items to recompute) must exist and be valid IDs

**Effects:**
- recomputes scores for the specified media items from all logged interactions, resetting existing scores and updating them based on current interaction data.
- The 'placeId' is a contextual argument and not used to filter internal state within this concept due to concept independence.

**Request Body:**
```json
{
  "placeId": "ID",
  "mediaItemIds": ["ID"]
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

# API Specification: QualityRanking Concept

**Purpose:** surface lesser-known places that have high engagement but low mainstream visibility

---

## API Endpoints

### POST /api/QualityRanking/updateMetrics

**Description:** Updates metrics (visitorVolume, engagementRatio, lastUpdated) for a given place. If metrics for the place do not exist, they are created. This action does NOT recompute the qualityScore; that is handled by `calculateQualityScore`.

**Requirements:**
- place exists and visits >= 0 and engagement >= 0

**Effects:**
- updates metrics (visitorVolume, engagementRatio, lastUpdated) for a given place.
- If metrics for the place do not exist, they are created.
- This action does NOT recompute the qualityScore; that is handled by `calculateQualityScore`.

**Request Body:**
```json
{
  "placeId": "string",
  "visits": "number",
  "engagement": "number"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/QualityRanking/calculateQualityScore

**Description:** Computes the engagement-to-visit ratio using the formula `engagement / max(visits, 1)`, updates the `qualityScore` for the place in the database, and returns the newly computed score.

**Requirements:**
- place exists and has engagement metrics (visitorVolume and engagementRatio) recorded

**Effects:**
- computes the engagement-to-visit ratio using the formula `engagement / max(visits, 1)`
- updates the `qualityScore` for the place in the database
- returns the newly computed score.

**Request Body:**
```json
{
  "placeId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "score": "number"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/QualityRanking/setPreferences

**Description:** Stores or updates the ranking preferences for the given user, including their preference for emergent places and their desired recommendation radius.

**Requirements:**
- user is authenticated (this external check is typically handled by syncs) and radius > 0

**Effects:**
- stores or updates the ranking preferences for the given user, including their preference for emergent places and their desired recommendation radius.

**Request Body:**
```json
{
  "userId": "string",
  "prefersEmergent": "boolean",
  "radius": "number"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/QualityRanking/_getRecommendedPlaces

**Description:** Returns a list of recommended places (by their ID), ranked according to user preferences. (Note: geographical filtering using `centerLat`, `centerLng`, and `radius` is currently ignored due to concept's state limitations; it ranks all available places.)

**Requirements:**
- user has ranking preferences and coordinates (centerLat, centerLng) are valid

**Effects:**
- returns a list of recommended places (by their ID), ranked according to user preferences.

**Request Body:**
```json
{
  "userId": "string",
  "centerLat": "number",
  "centerLng": "number"
}
```

**Success Response Body (Query):**
```json
[
  {
    "place": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: InterestFilter Concept

**Purpose:** allow users to express their interests so places can be filtered to match their preferences

---

## API Endpoints

### POST /api/InterestFilter/setPreferences

**Description:** Saves a user's manually set preferences.

**Requirements:**
- user is authenticated, tags not empty, and all tags in AllowedTags

**Effects:**
- saves preferences for user with source="manual"

**Request Body:**
```json
{
  "userId": "Id",
  "tags": "string[]"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/InterestFilter/inferPreferencesFromText

**Description:** Uses an AI model to interpret natural language text and suggest tags and optional exclusions for a user.

**Requirements:**
- user is authenticated and text is not empty

**Effects:**
- calls an AI model to interpret the text and suggest tags and optional exclusions, records confidence and rationale, stores them in UserInferredPrefs, and updates UserPreferences with source = "llm" and the inferred tags

**Request Body:**
```json
{
  "userId": "Id",
  "text": "string",
  "radius": "number (optional)",
  "locationHint": "string (optional)"
}
```

**Success Response Body (Action):**
```json
{
  "tags": "string[]",
  "exclusions": "string[]",
  "confidence": "number",
  "rationale": "string",
  "warnings": "string[]",
  "needsConfirmation": "boolean (optional)"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/InterestFilter/tagPlace

**Description:** Associates a specific tag with a given place.

**Requirements:**
- place exists and tag in AllowedTags

**Effects:**
- associates the tag with the place in PlaceTags

**Request Body:**
```json
{
  "placeId": "Id",
  "tag": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/InterestFilter/clearPreferences

**Description:** Removes all preferences (manual and inferred) for a specific user.

**Requirements:**
- user is authenticated

**Effects:**
- removes all UserPreferences and UserInferredPrefs for the user

**Request Body:**
```json
{
  "userId": "Id"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/InterestFilter/getMatchingPlaces

**Description:** Retrieves a list of places that match a user's preferences, ranked by relevance.

**Requirements:**
- user has either set manual or llm preferences

**Effects:**
- returns places whose tags overlap with user's preferred tags, ranked by relevance score, down-ranking places that match excluded tags

**Request Body:**
```json
{
  "userId": "Id",
  "places": "Id[]"
}
```

**Success Response Body (Action):**
```json
{
  "matches": "Id[]"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---
