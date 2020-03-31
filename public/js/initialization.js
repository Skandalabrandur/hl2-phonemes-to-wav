// A HORRIBLE SIN I'VE YET TO REMEDY
// EXTRACT SOME ANONYMOUS FUNCTIONS
// TO THEIR RESPECTIVE FUNCTIONS.JS FILE
// IN ORDER TO INCREASE MAINTAINABILITY
// Init & load
document.addEventListener('DOMContentLoaded', function () {
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        height: 512,
        plugins: [
            WaveSurfer.regions.create({
                regions: []
            })
        ],
        waveColor: 'white',
    });
    wavesurfer.on('region-click', function (region, e) {
        e.stopPropagation();
        wavesurfer.play(region.start, region.end);
    });

});

// Allow spacebar to play/pause
document.body.onkeyup = function (e) {
    if (e.keyCode == 32) {
        wavesurfer.playPause();
    }
}

document.querySelector("#createBtn").onclick = async () => {
    document.querySelector("#phonemeinput").value = await generateBlock()
    document.querySelector("#daform").submit();
}

document.querySelector("#collapseBtn").onclick = () => {
    var regions = Object.values(wavesurfer.regions.list);
    for (i = 0; i < regions.length; i++) {
        collapseRegion(regions[i]);
    }
}

// Iterates through all regions and removes overlap
// A region's start has precedence over another region's
// end, that is, end times can be shortened but start
// times remain consistent.
// This hasn't been tested for 100% overlaps and I
// am lazy enough to declare that a user error (though I shouldn't :Þ)
document.querySelector("#overlapBtn").onclick = () => {
    // Take backups and sort regions by time
    var regions = Object.values(wavesurfer.regions.list);
    regions = regions.sort((a, b) => {
        if (a.start > b.start) {
            return 1;
        }
        return -1;
    });

    // Clear old regions
    wavesurfer.clearRegions();

    // Re-inject regions but clear overlap (start time precedence)
    for (k = 0; k < regions.length; k++) {
        if (k != regions.length - 1) {
            let fend = regions[k].end;
            let sstart = regions[k + 1].start;

            if (fend > sstart) {
                regions[k].end = regions[k + 1].start;
            }
        }
        wavesurfer.addRegion({
            start: regions[k].start,
            end: regions[k].end,
            attributes: regions[k].attributes,
            drag: true,
            color: "rgba(255, 255, 255, 0.9)"
        });
    }
}

document.querySelector("#undoPhonemeBtn").onclick = () => {
    popPhoneme();
}

document.querySelector("#addWordBtn").onclick = async () => {
    let words = await prompt("Please enter word/s").split(" ");

    for (j = 0; j < words.length; j++) {
        addRegion(words[j]);
        globalWordList.push(words[j]);
        let phonemes = await fetchWord(words[j]);
        if (phonemes.length == 0) {
            var resolution = new Promise((resolve, reject) => {
                phonemeModal(words[j], resolve);
            });
            var userphonemes = await resolution;
            addWord(words[j].toLowerCase(), userphonemes);
        }
    }
}

window.addEventListener('wheel', function (event) {
    if (event.deltaY < 0) {
        zoomLevel += 30;
        if (zoomLevel > 1000) {
            zoomLevel = 1000;
        }
    } else if (event.deltaY > 0) {
        zoomLevel -= 30;
        if (zoomLevel < 20) {
            zoomLevel = 20;
        }
    }
    wavesurfer.zoom(zoomLevel);
});

// Enable modal tooltips and phoneme selectors
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();

    // Couldn't get this to work with jQuery quick enough so I defaulted to vanilla js lol
    var selectors = document.getElementsByClassName("phonemeSelector");
    for(i = 0; i < selectors.length; i++) {
        selectors[i].onclick = (e) => {
            addPhoneme(e.target.textContent);
        }
    }
});

