import { _decorator, CCBoolean, CCFloat, CCInteger, CCString, Component, director, game, Input, Label, Node, PhysicsSystem2D, sys, System, VERSION } from 'cc';
import { ConstantBase } from '../ConstantBase';
import super_html_playable from './super_html_playable';
const { ccclass, property } = _decorator;

@ccclass('ManagerEvent')
export class ManagerEvent extends Component {

    @property({ group: { name: 'Store' }, type: CCBoolean })
    DirectStore: boolean = false;
    @property({ group: { name: 'Store' }, type: CCString })
    OnDirectStore: string = ConstantBase.DIRECT_STORE;
    @property({ group: { name: 'Store' }, type: CCFloat })
    DelayDirectStore: number = 0;
    @property({ group: { name: 'Store' }, type: CCString })
    Android: string = '';
    @property({ group: { name: 'Store' }, type: CCString })
    IOS: string = '';
    @property({ group: { name: 'Store' }, type: CCInteger })
    AdsType: number = 0;

    @property({ group: { name: 'End' }, type: CCBoolean })
    LoopComplete: boolean = false;
    @property({ group: { name: 'End' }, type: CCBoolean })
    LoopLose: boolean = false;

    @property({ group: { name: 'Press' }, type: CCBoolean })
    DirectPress: boolean = false;
    @property({ group: { name: 'Press' }, type: CCBoolean })
    DirectPressOnce: boolean = false;
    @property({ group: { name: 'Press' }, type: CCString })
    EmitDirectPress: string = ConstantBase.DIRECT_PRESS;

    @property({ group: { name: 'Limit' }, type: CCBoolean })
    LimitActive: boolean = true;
    @property({ group: { name: 'Limit' }, type: CCFloat })
    LimitDuration: number = 30;
    @property({ group: { name: 'Limit' }, type: CCString })
    EmitLimit: string = ConstantBase.GAME_TIME_OUT;
    @property({ group: { name: 'Limit' }, type: CCString })
    LimitTimeFormat: string = '(time)s';
    @property({ group: { name: 'Limit' }, type: Label })
    LimitTimeLabel: Label = null;

    static Finish: boolean = false;

    m_directPress: Node = null;
    m_storeOpen: boolean = false;
    m_limitCountdown: number;

    protected onLoad(): void {
        super_html_playable.set_google_play_url(this.Android);
        super_html_playable.set_app_store_url(this.IOS);

        game.frameRate = 59;
        PhysicsSystem2D.instance.enable = true;

        this.m_directPress = this.node.getChildByName('press');

        if (ManagerEvent.Finish) {
            this.m_directPress.on(Input.EventType.TOUCH_START, this.onStore, this);
            return;
        }

        director.on(this.OnDirectStore, this.onStore, this);

        director.on(ConstantBase.PLAYER_COMPLETE, this.onStop, this);
        director.on(ConstantBase.PLAYER_DEAD, this.onStop, this);
        if (this.LoopComplete)
            director.on(ConstantBase.GAME_COMPLETE, this.onRestart, this);
        else
            director.on(ConstantBase.GAME_COMPLETE, this.onStop, this);
        if (this.LoopLose) {
            director.on(ConstantBase.GAME_LOSE, this.onRestart, this);
            director.on(ConstantBase.GAME_TIME_OUT, this.onRestart, this);
        }
        else {
            director.on(ConstantBase.GAME_LOSE, this.onStop, this);
            director.on(ConstantBase.GAME_TIME_OUT, this.onStop, this);
        }

        if (this.DirectStore && this.DirectPress) {
            //First press not open store yet
            director.on(ConstantBase.GAME_COMPLETE, this.onPressStoreInit, this);
            director.on(ConstantBase.GAME_LOSE, this.onPressStoreInit, this);
            director.on(ConstantBase.GAME_TIME_OUT, this.onPressStoreInit, this);
        }
        else if (this.DirectStore) {
            //First press open store
            this.m_directPress.on(Input.EventType.TOUCH_START, this.onStore, this);
        }
        else if (this.DirectPress) {
            //Press to emit event
            this.m_directPress.on(Input.EventType.TOUCH_START, this.onPress, this);
            director.on(ConstantBase.CONTROL_LOCK, this.onLock, this);
            director.on(ConstantBase.CONTROL_RESUME, this.onResume, this);
        }
    }

    protected start(): void {
        if (this.LimitActive) {
            if (this.LimitTimeLabel != null) {
                this.m_limitCountdown = this.LimitDuration;
                this.onLimitCountdown();
            }
            else
                this.scheduleOnce(() => director.emit(this.EmitLimit), this.LimitDuration);
        }

        //mintegral
        window.gameReady && window.gameReady();
    }

    //STORE:

    get_debug_link() {
        switch (sys.os) {
            case sys.OS.ANDROID:
                return this.Android;
            case sys.OS.IOS:
                return this.IOS;
        }
        return this.Android != '' ? this.Android : this.IOS;
    }

    onStore() {
        let link = this.get_debug_link();
        this.scheduleOnce(() => {
            super_html_playable.download();
            super_html_playable.game_end();
            console.log('open store ' + link);
        }, this.DelayDirectStore);
    }

    //GAME:

    onRestart() {
        ManagerEvent.Finish = true;
        director.loadScene(director.getScene().name); //NOTE: Only work after build
        console.log('restart scene');
    }

    onStop() {
        this.unscheduleAllCallbacks();
        this.onPressStoreInit();
    }

    onLock() {
        this.m_directPress.off(Input.EventType.TOUCH_START, this.onPress, this);
    }

    onResume() {
        this.m_directPress.on(Input.EventType.TOUCH_START, this.onPress, this);
    }

    //PRESS:

    onPress() {
        director.emit(this.EmitDirectPress);
        if (this.DirectPressOnce) {
            this.m_directPress.off(Input.EventType.TOUCH_START, this.onPress, this);
            director.off(ConstantBase.CONTROL_LOCK, this.onLock, this);
            director.off(ConstantBase.CONTROL_RESUME, this.onResume, this);
        }
    }

    onPressStoreInit() {
        this.m_directPress.off(Input.EventType.TOUCH_START, this.onPress, this);
        director.off(ConstantBase.CONTROL_LOCK, this.onLock, this);
        director.off(ConstantBase.CONTROL_RESUME, this.onResume, this);

        if (this.DirectStore || ManagerEvent.Finish)
            this.m_directPress.on(Input.EventType.TOUCH_START, this.onStore, this);
    }

    //LIMIT:

    onLimitCountdown() {
        //Label show time
        this.LimitTimeLabel.string = this.LimitTimeFormat.replace('(time)', this.m_limitCountdown.toString());
        //Check time to stop or continue
        if (this.m_limitCountdown == 0) {
            director.emit(this.EmitLimit);
            return;
        }
        this.m_limitCountdown--;
        //Delay caculated time every second(s)
        this.scheduleOnce(() => this.onLimitCountdown(), 1);
    }
} //