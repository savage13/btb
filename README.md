BotW BTB Database
-----------------

Database of Bullet Time Bounces with Video links and sources

Adding
------

Additions are welcome throught either a Pull Request on the btbs.yaml file or through an Issue.

Format should follow

```yaml
- type: Feature
  geometry:
    coordinates:
      - - -3554
        - -408
      - - -3228
        - 942
    type: LineString
  properties:
    urls:
      - url: https://www.youtube.com/watch?v=wKt9TJA2ps8&t=3230s
        user: bggdimm
        category: All Towers
      - url: https://youtu.be/sL4tb2FgNM0?t=3708
        user: Johnnyboomr
        category: AMQ
    enemy: Black Moblin
    enemy_id: '0xf8cd6229'
    to: Bridge near Kuh Takkar
    from: Ancient Columns
    time: 24
    name: Columns to Kuh Takkar
    file: btb_columns_mystathi.json
```

where 
- `coordinates` are the starting point and ending points.  The starting point is likely the BTB'ed enemy.
  - The format is a bit weird
- `urls` multiple urls are appreciated if they exist, but one should exist.
  - Videos should link to the start of the BTB
- `enemy_id` is the hash_id from the objmap.
- `to` and `from` fields are general region names.
- `time` is the BTB duration in seconds.
- `name` should be something like Somewhere to Fancy Place
- `file` is the name that gets created if the btb is downloaded, make it descriptive.

License
-------
BSD 2-Clause License
