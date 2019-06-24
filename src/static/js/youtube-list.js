class YoutubeList {

    constructor(box) {
        if(!box){ return }
        this.box = box;
        this.init();
    }

    init() {
        this.preload(true);
        this.getVideos();
        this.getVideosData();
        Promise.all(this.promises).then(values => {
            this.onInit();
            setTimeout(()=>{
                this.preload(false);
            }, 5000);
        });
    }

    onInit(){
        this.createItems();
        this.playVideo();
    }

    preload(flag) {
        if(flag){
            this.box.classList.add('_preload');
            this.box.innerHTML = '<div class="spinner"></div>';
        } else {
            this.box.classList.remove('_preload');
        }
    }

    getVideos() {
        const params = new URLSearchParams( window.location.search.slice(1) ),
            id = params.get('id'),
            regexp = /[\w\-]{11}/;

        let videos = [];

        if(id) {
            videos = id.split(',').map( str => {
                return str.trim();
            }).filter(str => {
                return regexp.test(str) && (str.length === 11);
            });
        }

        this.videosIds = videos;
    }

    ajaxGet(url){
        const promise = new Promise( (resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let result = { success: false};
            xhr.open('GET', url, true);
            xhr.send();
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const response = xhr.responseText;
                        let data;

                        try {
                            data = JSON.parse(response);
                        } catch(err){}

                        if(data){
                            result.success = true;
                            result.data = data;
                        } else {
                            result.error = 'No valid response';
                        }
                    } else {
                        result.error = xhr.status;
                    }
                    resolve(result);
                }
            }
        });
        return promise;
    }

    getVideosData() {
        this.videos = [];
        this.promises = [];

        this.videosIds.forEach( (videoId) => {
            const videoUrl = 'http://www.youtube.com/watch?v=' + videoId,
                url = '//noembed.com/embed?url=' + encodeURIComponent(videoUrl),
                promise = this.ajaxGet(url).then( (response) => {
                        const data = response.data || [],
                            title = data['title'] || '';

                        this.videos.push({
                                'id' : videoId,
                                'url' : videoUrl,
                                'title' : title,
                                'img' : ('//i.ytimg.com/vi/'+ videoId +'/hqdefault.jpg')
                            });
                    });
            this.promises.push(promise);
        });
    }

    createItems() {
        let html = '';
        if(this.videos.length){
            this.videos.forEach( video => {
                html += '<div class="youtube-list__item">'
                        + '<div class="youtube-list__box" data-video="'+ video.id +'">'
                            + '<div class="youtube-list__preview">'
                                + '<img class="youtube-list__img" src="'+ video.img +'">'
                                + ( video.title ? '<span class="youtube-list__title">'+ video.title +'</span>' : '')
                            + '</div>'
                        + '</div>'
                    + '</div>';

            });
        } else {
            html += '<div class="youtube-list__empty">No videos</div>';
        }
        this.box.innerHTML += html;
    }

    createVideoIframe(id, size) {
        const url = '//www.youtube.com/embed/'+ id +'?autoplay=1';
        let iframe = document.createElement('iframe');
        iframe.setAttribute('class', 'youtube-list__video');
        iframe.setAttribute('src', url);
        iframe.setAttribute('frameborder', 0);
        iframe.setAttribute('allowfullscreen', '');
        if(size){
            iframe.setAttribute('width', size.width);
            iframe.setAttribute('height', size.height);
        }
        return iframe;
    }

    playVideo() {
        const items = this.box.getElementsByClassName('youtube-list__box'),
            itemsArr = Array.from(items),
            onCLick = (item) =>{
                const id = item.getAttribute('data-video'),
                    videoIframe = this.createVideoIframe(id);

                if(this.currentVideo){
                    this.currentVideo.parentNode.removeChild(this.currentVideo);
                }

                if(this.currentBox){
                    this.currentBox.classList.remove('_hide');
                }

                item.classList.add('_hide');
                item.appendChild(videoIframe);
                this.currentBox = item;
                this.currentVideo = videoIframe;
        }

        itemsArr.forEach( item => {
            item.addEventListener('click', () => {
                onCLick(item);
            });
        });
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const box = document.getElementById('js-youtube-list');
    new YoutubeList(box);
});