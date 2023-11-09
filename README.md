# hl2-phonemes-to-wav
Small ruby server that hosts an application which allows you to attach phoneme data to wav files

# Installation

Make sure you have ruby installed on your system.
Then you can do
```
$~ gem install sinatra
$~ ruby server.rb
```

This should run your server on localhost:4567.
Simply visit that in your browser and get to work :D

# Usage

* Load a WAV file. It's important that this file has no lipsync data from Valve already on it.
* Add Words
  * Add phonemes to words that don't already have phonemes
* Drag/resize words to their respective places
* Collapse words
* Drag phonemes to their respective places
* Normalize
* Export wav file

# Known issues
* No edge case testing done. Only perfect workflow assumed
* Cannot edit files that already have a VDAT header
  * (Simple workaround is to open the WAV file in notepad++, yeah hecking lol, and deleting everything from the last VDAT occurrence)
  * No VDAT import
* TODO: disallow exporting until words have been collapsed and phoneme regions normalized (overlap erasure)

