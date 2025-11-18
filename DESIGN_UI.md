Context:
This is a search UI.
We query an API, currently 'http://localhost/api/v1'.
It already has various endpoints:
query:search
anchor/{anchor_id}
record/{record_id}/context

The database contains texts called records, they are vectorized, so a query returns a list of near matches too.

A record belongs to a unit which is a topical part of the full text called source. It is extracted from the unit along with many other items – also records –, every record has a kind (title, fact, person, etc).

Task:
Your task is to help me design the UI. We'll work step by step, I don't have a clear view yet. Feel free to propose ideas, as regards the wording of UI elements, you can be moderately funny, attractive, interesting, but maintain a pro tone too, as the app will be targeted to professionals.

Design rules:

- Stay responsive. On narrow screens you can hide e.g. the search box or the search results when we display content related to a chosen record
- Ensure easy navigation. When we choose a record or display the source meta, make it easy to go back to the search results or the search box
- Make room for a menu. We may provide advanced features for money/signup...
- The app will be hosted on aws, containerized. At the end of the build, I'll need a fully compliant static page
- I've started to add an api/query.ts and components/search-bar... Feel free to modify or suggest anything, but you must maintain modularity
