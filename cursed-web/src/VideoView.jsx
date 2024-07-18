import * as bindings from './cursed-egui';
import { useEffect, useState } from 'react';
import React from 'react';

const VideoView = ({ }) => {

    return (
        <div>
         
            <video src="video_1.mov" controls width="100%"></video>
        </div>
    )
}

export default VideoView;