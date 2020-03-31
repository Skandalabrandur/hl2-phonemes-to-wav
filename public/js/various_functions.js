// Called before committing a block as a precaution
// I am not sure how the HL2 phoneme API will
// handle unicode/foreign characters
function anglofy(str) {
    str = str.toLowerCase();
    str = str.replace(/á/g, "a");
    str = str.replace(/é/g, "e");
    str = str.replace(/ý/g, "y");
    str = str.replace(/ú/g, "u");
    str = str.replace(/í/g, "i");
    str = str.replace(/ó/g, "o");
    str = str.replace(/ö/g, "o");
    str = str.replace(/ð/g, "d");
    str = str.replace(/æ/g, "ae");
    str = str.replace(/þ/g, "th");
    return str;
}

// Parses the fileinput and loads
// the file contents into wavesurfer
function openFile(event) {
    var input = event.target;
    document.querySelector("#audiofileinput").blur();
    var reader = new FileReader();
    reader.onload = function(){
      var dataURL = reader.result;
      wavesurfer.load(dataURL);
    };
    reader.readAsDataURL(input.files[0]);
};

// What region is furthest along rn?
function findFurthestRegionTime() {
  var list = Object.values(wavesurfer.regions.list);

  if(list.length == 0) {
    return 0;
  }

  var longest = 0;

  for(i = 0; i < list.length; i++) {
    if(list[i].end > longest) {
      longest = list[i].end;
    }
  }
  return longest;
}

// Adds a word to the wavesurfer display
// There exists a bad code smell where I use a similar code
// for phonemes without augmenting this function for re-use because
// I am a lazy lazy sinner
// label: str -> displays the word for a region so that we're not left with anonymous blobs
function addRegion(label) {
  var duration = wavesurfer.getDuration();
  var rstart = findFurthestRegionTime();
  var rend = rstart + 0.5;

  if(rend >= duration) {
    rend = duration;
  }

  if(rstart >= duration) {
    alert('Cannot add word, it would go out of bounds\nAre you doing this sequentially from left to right?');
    return;
  }

  wavesurfer.addRegion({
    start: rstart,
    end: rend,
    attributes: {
      label: label.toUpperCase(),
      highlight: true,
      word: true
    },
    drag: true,
    color: "rgba(255, 255, 255, 0.7)"
  });
}