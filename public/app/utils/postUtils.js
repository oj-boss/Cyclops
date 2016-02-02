angular.module("PostUtils", ["ngSanitize", "ConstFactory"])
    .factory("postUtils", ["$sce", "constants", function($sce, constants){
        var utils = {};

        utils.addTags = function(text){
            var txtArr = text.trim().split(' ');
            var post = '';

            for(var i = 0; i < txtArr.length; i++){
                if(txtArr[i][0] === '#'){
                    txtArr[i] = '<span class="text-tag">' + txtArr[i] + '</span>'
                }

                post += txtArr[i] + ' ';
            }

            return $sce.trustAsHtml(post);
        };

        utils.moveTags = function($elem){
            setTimeout(function(){
                var container = $elem.parent().closest('div');
                var elemWidth = 0;
                var containerWidth = container.width();

                //gets the real width of the element
                $elem.children().each(function(){
                    elemWidth += $(this).width();
                });

                //can move if its real width is greater than 0.9 of it's containers width
                var movable = elemWidth > (containerWidth * 0.9);
                if(movable){
                    var distance = elemWidth - containerWidth;
                    if(distance < 0) distance = 0;

                    $elem.css({
                        'transition': 'all 2s ease-in-out'
                        , 'position': 'relative'
                        , 'left': -distance - 20 + 'px'
                        , 'padding': "5px 0px 5px 0px"
                    });

                    $elem.mouseleave(function(){
                        setTimeout(function(){
                            $elem.css({
                                'left': 0
                            })
                        }, 1000);
                    });
                }
            }, 1000);
        };

        utils.parseTags = function(tags){
            var tagHtml = "";

            tags.forEach(function(tag){
                if(tag[0] != "#"){
                    tagHtml += "<span>#" + tag + "</span> ";
                }
                else{
                    tagHtml += "<span>" + tag + "</span> ";
                }
            });
            return tagHtml;
        };

        utils.loadMedia = function(scope, mediaElem, file){
            var dim = file.dimension;
            var mediaDiv = angular.element(document.createElement("div"));
            var loading = document.createElement("img");
            var ASPECT_RATIO = 1.7;
            var width = 0;
            var height = 0;
            var media;

            loading.src = "/assets/img/loading.GIF";
            loading.width = scope.width * 0.05;

            if(file.mediaType == "image"){
                media = document.createElement("img");
                //TODO Remove the check for dim. It will always be available in the future
                var useScopeWidth = dim? dim.width > scope.width : true;
                width = useScopeWidth? scope.width : dim.width;
                if(dim) height = useScopeWidth? (width / (dim.width/dim.height)) : dim.height;
                else height = width/ASPECT_RATIO;

                media.width = width;
                media.onload = function(){
                    mediaDiv.css({
                        height: "auto"
                    });
                    angular.element(loading).replaceWith(media);
                };
            }

            else if(file.mediaType == "video"){
                //console.log(file);
                media = document.createElement("video");
                width = scope.width;
                height = width/ASPECT_RATIO;

                media.width = width;
                media.onloadedmetadata = function(){
                    media.id = file.media;
                    media.className += "video-js vjs-default-skin";
                    angular.element(loading).replaceWith(media);
                    videojs(media, {
                        "controls": true
                        , "autoplay": false
                        , "preload": "metadata"
                    }, function(){

                    });
                    mediaDiv.css({
                        height: "auto"
                    });

                    media.onloadedmetadata = null;
                };
            }

            else if(file.mediaType == "audio"){
                var audioDiv = angular.element(document.createElement("div"));
                var mediaImg = document.createElement("img");
                var imgDiv = angular.element(document.createElement("div"));
                var controlsDiv = angular.element(document.createElement("div"));
                var playbackDiv = angular.element(document.createElement("div"));
                var playDiv = angular.element(document.createElement("div"));
                var playImg = document.createElement("img");
                var pauseImg = document.createElement("img");
                var trackDiv = angular.element(document.createElement("div"));
                var track = document.createElement("input");
                var trackingDiv = angular.element(document.createElement("div"));
                var trackColor = angular.element(document.createElement("div"));
                var timeLeftDiv = angular.element(document.createElement("div"));
                var volumeCtrlDiv = angular.element(document.createElement("div"));
                var volumeIconDiv = angular.element(document.createElement("div"));
                var volumeIcon = document.createElement("img");
                var volumeDiv = angular.element(document.createElement("div"));
                var volume = document.createElement("input");
                var volumeLevelDiv = angular.element(document.createElement("div"));
                var volumeColor = angular.element(document.createElement("div"));
                media = document.createElement("audio");

                audioDiv.addClass("audio-div");

                mediaImg.src = "/assets/img/music2.svg";
                mediaImg.className = "media-img";

                imgDiv.append(mediaImg);
                imgDiv.addClass("img-div");

                pauseImg.src = "/assets/img/pause.png";
                pauseImg.className = "pause-img";

                playbackDiv.addClass("playback-div");
                playImg.onclick =  function(){
                    if(media.paused) {
                        media.play();
                        angular.element(playImg).replaceWith(pauseImg);
                    }
                };

                pauseImg.onclick = function(){
                    if(!media.paused) {
                        media.pause();
                        angular.element(pauseImg).replaceWith(playImg);
                    }
                };

                playDiv.addClass("play-div");
                playImg.src = "/assets/img/play.png";
                playImg.className = "play-img";
                playDiv.append(playImg);

                track.type = "range";
                track.min = 0;
                track.max = 1;
                track.step = 0.01;
                track.value = 0;
                track.className = "oj-slider";
                track.oninput = function(){
                    media.currentTime = Math.floor(media.duration * track.value);
                    trackingDiv.css({
                        width: track.value * 98 + "%"
                    });
                    timeLeftDiv.text(utils.parseSeconds(media.duration - media.currentTime));
                };

                trackingDiv.addClass("tracking-div");
                trackColor.addClass("track-color");

                trackDiv.addClass("track-div");
                trackDiv.append(trackColor);
                trackDiv.append(trackingDiv);
                trackDiv.append(track);

                volume.type = "range";
                volume.min = 0;
                volume.max = 1;
                volume.step = 0.01;
                volume.value = 1;
                volume.className = "oj-slider";
                volume.oninput = function(){
                    media.volume = volume.value;

                    volumeLevelDiv.css({
                        width: volume.value * 98 + "%"
                    });
                };

                volumeLevelDiv.css({
                    width: "98%"
                });

                volumeLevelDiv.addClass("tracking-div");
                volumeColor.addClass("track-color");

                volumeDiv.addClass("volume-track-div");
                volumeDiv.append(volumeColor);
                volumeDiv.append(volumeLevelDiv);
                volumeDiv.append(volume);

                volumeIcon.src = "/assets/img/volume.png";
                volumeIcon.className = "volume-icon";
                volumeIcon.onclick = function(){
                    if(media.muted){
                        media.muted = false;
                        volumeIcon.src = "/assets/img/volume.png";
                    }

                    else{
                        media.muted = true;
                        volumeIcon.src = "/assets/img/mute.png";
                    }
                };

                volumeIconDiv.addClass("volume-icon-div");
                volumeIconDiv.append(volumeIcon);

                timeLeftDiv.addClass("time-left-div");

                playbackDiv.append(playDiv);
                playbackDiv.append(trackDiv);
                playbackDiv.append(timeLeftDiv);

                volumeCtrlDiv.addClass("volume-ctrl-div");
                volumeCtrlDiv.append(volumeIconDiv);
                volumeCtrlDiv.append(volumeDiv);

                controlsDiv.addClass("controls-div");
                controlsDiv.append(playbackDiv);
                controlsDiv.append(volumeCtrlDiv);

                width = scope.width;
                height = width/4;

                audioDiv.append(imgDiv);
                audioDiv.append(controlsDiv);

                media.ontimeupdate = function(){
                    var currentTime = media.currentTime;
                    track.value = currentTime/media.duration;
                    var trackerWidth = Math.floor(track.value * 98);

                    if(trackerWidth)
                    trackingDiv.css({
                        width: trackerWidth + "%"
                    });

                    timeLeftDiv.text(utils.parseSeconds(media.duration - currentTime));
                };

                media.onended = function(){
                    angular.element(pauseImg).replaceWith(playImg);
                    playing = false;
                    media.currentTime = 0;
                    track.value = 0;
                    trackingDiv.css({
                        width: 0
                    });
                };

                media.onloadedmetadata = function(){
                    angular.element(loading).replaceWith(audioDiv);

                    if(scope.width < 400){
                        trackDiv.css({
                            width: "55%"
                        });
                    }
                    else if(scope.width < 500){
                        trackDiv.css({
                            width: "63%"
                        });
                    }

                    trackColor.width(angular.element(track).width());
                    volumeColor.width(angular.element(volume).width());

                    //cancel out extra width added by border
                    mediaDiv.width(scope.width - 1);

                    timeLeftDiv.text(utils.parseSeconds(media.duration));

                    media.onloadedmetadata = null;
                };

                media.preload = "metadata";
                media.volume = 1;
            }

            mediaDiv.width(width);
            mediaDiv.height(height);

            mediaDiv.css({
                "margin": file.mediaType == "image"? "0 auto 5px auto" : "0 0 5px 0"
            });

            loading.style.display = "block";
            loading.style.margin = "0 auto";
            loading.style.position = "relative";
            loading.style.top = "45%";
            mediaDiv.append(loading);
            mediaElem.append(mediaDiv);
            media.src = constants.media + "/" + file.media;
        };

        utils.parseSeconds = function(time){
            if(time < 60) return 0 + ":" + addZero(Math.floor(time));

            var hours = Math.floor(time/3600);
            var mins = Math.floor(time/60);
            var secs = addZero(Math.floor(time - (mins * 60)));
            var parsedTime = hours? addZero(mins) : mins + ":" + secs;

            return hours? hours + ":" + parsedTime : parsedTime;
        };

        var addZero = function(number){
            return number < 10 ? "0" + number : number;
        };

        return utils;
    }]);