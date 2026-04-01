# Sunday Location Poller

This is the exact iPhone Shortcut recipe for the simplified backend polling flow.

It does not wait for a text message. Instead, it:
1. asks your Sunday backend if a location request is pending
2. exits immediately if there is no request
3. gets your current location
4. posts it back to a fixed backend endpoint

Use your Tailscale hostname or Tailscale IP for the base URL.

Example base URL:
- `http://your-mac.tailnet-name.ts.net:8000`
- or `http://100.x.y.z:8000`

## Shortcut actions

1. `Text`
   Put this exactly:
   `http://your-mac.tailnet-name.ts.net:8000/api/location/request/latest`

2. `Get Contents of URL`
   URL: `Text`
   Method: `GET`

3. `Get Dictionary from Input`
   Input: `Contents of URL`

4. `Get Dictionary Value`
   Key: `pending`
   Save as `Pending`

5. `If`
   Condition: `Pending` `is` `true`

6. `Get Current Location`

7. `Get Details of Location`
   Input: `Current Location`
   Detail: `Latitude`

8. `Get Details of Location`
   Input: `Current Location`
   Detail: `Longitude`

9. `Get Details of Location`
   Input: `Current Location`
   Detail: `Name`

10. `Text`
    Put this exactly:
    `http://your-mac.tailnet-name.ts.net:8000/api/location/respond/latest`

11. `Get Contents of URL`
    URL: the `Text` from the previous step
    Method: `POST`
    Request Body: `JSON`
    JSON fields:
    - `lat` -> `Latitude`
    - `lng` -> `Longitude`
    - `address` -> `Name`

12. `Otherwise`
    Do nothing

13. `End If`

## Notes

- `GET /api/location/request/latest` always returns JSON, so the Shortcut does not need to handle `404` for the poll step.
- The backend matches the reply to the oldest pending request automatically, so the Shortcut does not need to parse or carry `request_id`, `token`, or `callback_url`.
- Tailscale is the cleanest way to make this work across your phone and Mac without exposing the endpoint publicly.
