// Each phoneme has a numerical ID
// that needs to be include within a Word->Phoneme block
// If input:string is a phoneme from the Valve list then a number greater
// than zero is returned
function getPhonemeId(str) {
    str = str.toLowerCase();
    let phonemes = {
        "aa2": 97,
        "b": 98,
        "d": 100,
        "ey": 101,
        "f": 102,
        "g": 103,
        "hh": 104,
        "iy": 105,
        "y": 106,
        "c": 107,   // Can't find documentation for this. Suspect GYA in gyah
        "l": 108,
        "m": 109,
        "n": 110,
        "ow": 111,
        "p": 112,
        "r2": 114,  // Can't find documentation but in testing looks like rolled r
        "s": 115,
        "t": 116,
        "uw": 117,
        "v": 118,
        "w": 119,
        "z": 122,
        "ae": 230,
        "dh": 240,
        "nx": 331,  // Can't find documentation but I think this is n with stop similar to ax
        "aa": 593,
        "ao": 596,
        "ax": 601,
        "er": 602,
        "eh": 603,
        "ax2": 604, // Can't find documentation for this but suspect ax is enough
        "er2": 605, // Can't find documentation for this but suspect er is enough
        "g2": 609,  // Can't find documentation for this but suspect g  is enough
        "hh2": 614, // Can't find documentation for this but suspect hh is enough
        "ih2": 616, // Can't find documentation for this but suspect ih is enough
        "ih": 618,
        "l2": 619,  // Can't find documentation for this but suspect l  is enough
        "r": 633,
        "r3": 635,  // Can't find documentation for this but suspect r and r2 are enough
        "d2": 638,  // Can't find documentation for this but suspect d  is enough
        "sh": 643,
        "uh": 650,
        "ah": 652,
        "zh": 658,
        "jh": 676,
        "ch": 679,
        "th": 952,
    }
    return 0 + phonemes[str];
}

// Creates a phoneme block for the given wav file
// Depends on some global variables such as wavesurfer and globalWordList
// Note that even though the emphasis block is empty, it is still a required parameter
// BIG OOF NOTE: The generation assumes a left-to-right workflow, that is, no
// intermittent word injection. I haven't tested whether non-sequential block
// declarations will break the game
async function generateBlock() {
    var currentIndex = 0;
    var regions = Object.values(wavesurfer.regions.list);
    regions = regions.sort((a, b) => {
        if (a.start > b.start) {
            return 1;
        }
        return -1;
    });

    var block = "VERSION 1.0\n"
    block += "PLAINTEXT\n";
    block += "{\n";
    block += anglofy(globalWordList.join(" "));
    block += "\n";
    block += "}\n";
    block += "WORDS\n";
    block += "{\n";

    for (j = 0; j < globalWordList.length; j++) {
        var phonemes = await fetchWord(globalWordList[j]);
        var wordlength = phonemes.length;
        var wordstart = parseFloat(regions[currentIndex].start).toPrecision(4);
        var wordend = parseFloat(regions[currentIndex + wordlength - 1].end).toPrecision(4);

        block += "WORD " + anglofy(globalWordList[j]) + " " + wordstart + " " + wordend + "\n";
        block += "{\n";

        for (k = 0; k < wordlength; k++) {
            var region = regions[currentIndex];
            currentIndex += 1;

            var phonemeId = getPhonemeId(region.attributes.label);
            block += phonemeId + " " + region.attributes.label + " " + parseFloat(region.start).toPrecision(4);
            block += " " + parseFloat(region.end).toPrecision(4) + " 1\n";
        }

        block += "}\n";
    }

    block += `}
EMPHASIS
{
}
OPTIONS
{
voice_duck 0
}`;
    return block;
}

// Returns an array of phonemes for a particular word entry
// If no word found, then an empty array is returned
function fetchWord(word) {
    return fetch(`http://localhost:4567/word/${word.toLowerCase()}`)
        .then(response => response.json())
        .then(data => {
            return data;
        });
}

// Adds a word entry
// Word: string,
// Phonemes: array[string, ...]
function addWord(word, phonemes) {
    word = word.toLowerCase();
    var data = {
        word: word,
        phonemes: phonemes
    };
    fetch(`http://localhost:4567/word/`, {
        method: "post",
        body: JSON.stringify(data)
    });
}

// Iterates through regions
// If a region is a word, then it will collapse that region into phonemes
// The word region is split evenly amongst phoneme regions
async function collapseRegion(region) {
    if (region.attributes.word) {
        var phonemes = await fetchWord(region.attributes.label);
        var start = region.start;
        var end = region.end;
        var delta = end - start;
        var average = delta / phonemes.length;

        region.remove();

        for (i = 0; i < phonemes.length; i++) {
            wavesurfer.addRegion({
                start: start,
                end: start + average,
                attributes: {
                    label: phonemes[i],
                    highlight: true,
                    word: false
                },
                drag: true,
                color: "rgba(255, 255, 255, 0.9)"
            });
            start += average;
        }
    }
}

// word: a word without an entry
// resolution: a promise resolved by user input
async function phonemeModal(word, resolution) {
    $("#phonemeModal").show();
    $("#phonemeModalWord").text("Please input phonemes for: " + word);
    $("#phonemeModalList").text("");
    document.querySelector("#saveWordBtn").onclick = () => {
        let phonemes = document.querySelector("#phonemeModalList").textContent.split(" ");
        console.log(phonemes);
        resolution(phonemes);
        $("#phonemeModal").hide();
    };
}

// A list of phonemes for a word inside the phoneme popup modal
function addPhoneme(phoneme) {
    var phonemeList = document.querySelector("#phonemeModalList");
    var phonemes;
    // Empty string glitch avoided yus
    if(phonemeList.textContent.length != 0) {
        phonemes = phonemeList.textContent.split(" ");
    } else {
        phonemes = [];
    }
    phonemes.push(phoneme);
    phonemeList.textContent = phonemes.join(" ");
}

function popPhoneme() {
    var phonemeList = document.querySelector("#phonemeModalList");
    let phonemes = phonemeList.textContent.split(" ");
    phonemes.pop()
    phonemeList.textContent = phonemes.join(" ");
}