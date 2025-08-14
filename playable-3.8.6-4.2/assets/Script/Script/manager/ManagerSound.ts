import { _decorator, AudioSource, CCBoolean, Component, director, sys } from 'cc';
import { ConstantBase } from '../ConstantBase';
const { ccclass, property } = _decorator;

@ccclass('ManagerSound')
export class ManagerSound extends Component {

    @property(CCBoolean)
    AudioDebug: boolean = false;

    @property(AudioSource)
    AudioMusic: AudioSource = null;

    protected onLoad() {
        if (this.AudioMusic == null)
            this.AudioMusic = this.getComponent(AudioSource);
        director.on(ConstantBase.PLAYER_COMPLETE, this.onStopMusic, this);
        director.on(ConstantBase.PLAYER_DEAD, this.onStopMusic, this);

        //director.on(BaseEventConstant.GAME_COMPLETE, this.onStopMusic, this);
        //director.on(BaseEventConstant.GAME_LOSE, this.onStopMusic, this);
        //director.on(BaseEventConstant.GAME_TIME_OUT, this.onStopMusic, this);
        //
        window.director = director;
        director.on("onVolumeChanged", this.onVolumeChanged, this);
        this.onVolumeChanged(window.isMute);
    }

    protected start() {
        switch (sys.os) {
            case sys.OS.ANDROID:
            case sys.OS.IOS:
                //
                break;
            default:
                if (!this.AudioDebug) {
                    console.log('Audio music on pc web platform were turn off');
                    this.AudioMusic.volume = 0;
                }
                break;
        }
    }

    protected onDestroy() {
        director.off("onVolumeChanged", this.onVolumeChanged, this);
    }

    onVolumeChanged(mute: boolean) {
        const audioSources = this.getComponentsInChildren(AudioSource);
        audioSources.forEach(e => {
            e.volume = mute ? 0 : 1;
        });
    }

    onStopMusic() {
        this.AudioMusic.stop();
    }
}