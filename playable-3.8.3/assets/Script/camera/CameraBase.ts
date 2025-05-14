import { _decorator, Component, Node, CCFloat, view, screen, Vec3, CCBoolean, Camera, Tween, Vec2, director, tween, v2, v3, Rect, TweenEasing, math, Enum, sys, CCString } from 'cc';
import { ConstantBase, EaseType } from '../ConstantBase';
const { ccclass, property } = _decorator;

export enum OrientationType {
    PORTRAIT,
    LANDSCAPE,
}
Enum(OrientationType)

class NodeTweener {
    Base: CameraBase = null;
    Value = null;
    Easing: string = 'linear';
}

@ccclass('CameraBase')
export default class CameraBase extends Component {

    static instance: CameraBase;

    //SOLUTION TARGET DEFAULT IS 1920x1080 in ConstantBase.ts script

    @property(Node)
    Target: Node | null = null;

    @property({ group: { name: 'Main' }, type: CCFloat })
    SmoothTime: number = 0.1;
    @property({ group: { name: 'Main' }, type: CCFloat })
    Scale: number = 1;
    @property({ group: { name: 'Main' }, type: Vec2 })
    Offset: Vec2 = v2(0, 0);
    @property({ group: { name: 'Main' }, type: CCBoolean })
    LockX: boolean = false;
    @property({ group: { name: 'Main' }, type: CCBoolean })
    LockY: boolean = false;

    @property({ group: { name: 'Limit' }, type: CCBoolean })
    Limit: boolean = false;
    @property({ group: { name: 'Limit' }, type: Vec2, visible(this: CameraBase) { return this.Limit; } })
    LimitMax: Vec2 = v2(1000, 1000);
    @property({ group: { name: 'Limit' }, type: Vec2, visible(this: CameraBase) { return this.Limit; } })
    LimitMin: Vec2 = v2(-1000, -1000);

    @property({ group: { name: 'Ortho' }, type: CCBoolean })
    OrthoScreen: boolean = false;
    @property({ group: { name: 'Ortho' }, type: CCFloat, visible(this: CameraBase) { return this.OrthoScreen; } })
    OrthoLandscape: number = 1;
    @property({ group: { name: 'Ortho' }, type: CCFloat, visible(this: CameraBase) { return this.OrthoScreen; } })
    OrthoPortrait: number = 1;

    @property({ group: { name: 'Rect' }, type: CCBoolean })
    RectScreen: boolean = false;
    @property({ group: { name: 'Rect' }, type: OrientationType, visible(this: CameraBase) { return this.RectScreen; } })
    RectTarget: OrientationType = OrientationType.LANDSCAPE;
    @property({ group: { name: 'Rect' }, type: CCFloat, visible(this: CameraBase) { return this.RectScreen && this.RectTarget == OrientationType.LANDSCAPE; } })
    RectTargetLandscape: number = 1.0;
    @property({ group: { name: 'Rect' }, type: CCFloat, visible(this: CameraBase) { return this.RectScreen && this.RectTarget == OrientationType.PORTRAIT; } })
    RectTargetPortrait: number = 1.0 * ConstantBase.SOLUTION_PORTRAIT.x / ConstantBase.SOLUTION_PORTRAIT.y; //1080:1920 = 0.5625
    @property({ group: { name: 'Rect' }, type: CCBoolean, visible(this: CameraBase) { return this.RectScreen; } })
    RectLandScapeFixed: boolean = false;
    @property({ group: { name: 'Rect' }, type: Rect, visible(this: CameraBase) { return this.RectScreen && this.RectLandScapeFixed; } })
    RectLandscape: Rect = new Rect(0, 0, 1, 1);
    @property({ group: { name: 'Rect' }, type: CCBoolean, visible(this: CameraBase) { return this.RectScreen; } })
    RectPortraitFixed: boolean = false;
    @property({ group: { name: 'Rect' }, type: Rect, visible(this: CameraBase) { return this.RectScreen && this.RectPortraitFixed; } })
    RectPortrait: Rect = new Rect(0, 0.25, 1, 0.5);
    @property({ group: { name: 'Rect' }, type: CCBoolean, visible(this: CameraBase) { return this.RectScreen; } })
    RectDebug: boolean = false;

    @property({ group: { name: 'Switch' }, type: CCBoolean })
    SwitchTween: boolean = false;
    @property({ group: { name: 'Switch' }, type: CCFloat, visible(this: CameraBase) { return this.SwitchTween; } })
    SwitchTweenDuration: number = 0.5;
    @property({ group: { name: 'Switch' }, type: EaseType, visible(this: CameraBase) { return this.SwitchTween; } })
    SwitchTweenEasing: EaseType = EaseType.linear;

    m_camera: Camera = null;
    m_orthoHeight: number = 0;
    m_posCurrent: Vec3;
    m_posTarget: Vec3;

    m_orientation = OrientationType.LANDSCAPE;
    m_solution: math.Size;
    m_view: Vec2;
    m_solutionViewed: math.Size;
    m_solutionTarget: Vec2;

    m_update: boolean = true;
    m_lock: Vec3;
    m_shake: boolean = false;

    m_tweenOffset: NodeTweener = null;
    m_tweenSwitch: NodeTweener = null;
    m_tweenScale: NodeTweener = null;
    m_tweenShake: Tween<Node> = null;
    m_tweenShakeOnce: Tween<Node> = null;

    //

    protected onLoad() {
        CameraBase.instance = this;

        director.on(ConstantBase.CAMERA_SWITCH, this.onSwitchTween, this);
        director.on(ConstantBase.CAMERA_SMOOTH_TIME, this.onSmoothTime, this);
        director.on(ConstantBase.CAMERA_OFFSET, this.onOffsetTween, this);
        director.on(ConstantBase.CAMERA_SCALE, this.onScaleTween, this);
        director.on(ConstantBase.CAMERA_EFFECT_SHAKE, this.onShake, this);
        director.on(ConstantBase.CAMERA_EFFECT_SHAKE_ONCE, this.onShakeOnce, this);

        director.on(ConstantBase.NODE_BODY_X4, this.onShake, this);

        if (this.m_camera == null)
            this.m_camera = this.getComponent(Camera);
        this.m_orthoHeight = this.m_camera.orthoHeight.valueOf();

        if (this.LockX || this.LockY)
            this.m_lock = this.node.worldPosition.clone();

        this.m_solutionTarget = this.RectTarget == OrientationType.LANDSCAPE ? ConstantBase.SOLUTION_LANDSCAPE : ConstantBase.SOLUTION_PORTRAIT;
        this.m_solutionTarget = this.m_solutionTarget.clone().multiplyScalar(this.RectTarget == OrientationType.LANDSCAPE ? this.RectTargetLandscape : this.RectTargetPortrait);
    }

    protected start() {
        this.onPositionInit();

        //NOTE: This event must add from Start to get event!
        view.on('canvas-resize', () => {
            this.onCanvasResize();
        });
        this.onCanvasResize();
    }

    protected lateUpdate(dt: number) {
        let posTarget = v3();
        if (this.Target != null) {
            posTarget = this.Target.worldPosition.clone();
            this.m_posTarget = posTarget.clone();
        }
        else {
            posTarget = this.m_posTarget.clone();
        }

        if (!this.m_update)
            return;

        //LOCK:
        if (this.LockX)
            posTarget.x = this.m_lock.x;
        if (this.LockY)
            posTarget.y = this.m_lock.y;

        //OFFSET:
        posTarget.x += this.Offset.x;
        posTarget.y += this.Offset.y;

        //LIMIT:
        if (this.Limit) {
            if (!this.LockX) {
                if (posTarget.x > this.LimitMax.x)
                    posTarget.x = this.LimitMax.x;
                else if (posTarget.x < this.LimitMin.x)
                    posTarget.x = this.LimitMin.x;
            }
            if (!this.LockY) {
                if (posTarget.y > this.LimitMax.y)
                    posTarget.y = this.LimitMax.y;
                else if (posTarget.y < this.LimitMin.y)
                    posTarget.y = this.LimitMin.y;
            }
        }

        //FINAL:
        if (this.SmoothTime > 0) {
            this.m_posCurrent = this.m_posCurrent.lerp(posTarget, this.SmoothTime);
            this.node.worldPosition = this.m_posCurrent.clone();
        }
        else {
            this.m_posCurrent = posTarget.clone();
            this.node.worldPosition = this.m_posCurrent.clone();
        }
    }

    private onPositionInit() {
        let posTarget = v3();
        if (this.Target != null) {
            posTarget = this.Target.worldPosition.clone();
            this.m_posTarget = posTarget.clone();
        }
        else {
            posTarget = this.node.worldPosition.clone();
            this.m_posTarget = posTarget.clone();
        }

        //LOCK:
        if (this.LockX)
            posTarget.x = this.m_lock.x;
        if (this.LockY)
            posTarget.y = this.m_lock.y;

        //OFFSET:
        posTarget.x += this.Offset.x;
        posTarget.y += this.Offset.y;

        //LIMIT:
        if (this.Limit) {
            if (!this.LockX) {
                if (posTarget.x > this.LimitMax.x)
                    posTarget.x = this.LimitMax.x;
                else if (posTarget.x < this.LimitMin.x)
                    posTarget.x = this.LimitMin.x;
            }
            if (!this.LockY) {
                if (posTarget.y > this.LimitMax.y)
                    posTarget.y = this.LimitMax.y;
                else if (posTarget.y < this.LimitMin.y)
                    posTarget.y = this.LimitMin.y;
            }
        }

        //FINAL:
        this.m_posCurrent = posTarget.clone();
        this.node.worldPosition = this.m_posCurrent.clone();
    }

    //EVENT

    protected onCanvasInit() {
        this.onCanvasCurrent();
    }

    protected onCanvasCurrent() {
        this.m_solution = screen.windowSize.clone();
        this.m_view = v2(view.getScaleX(), view.getScaleY());
        this.m_solutionViewed = new math.Size(this.m_solution.width / this.m_view.x, this.m_solution.height / this.m_view.y);
        this.m_orientation = this.m_solutionViewed.width < this.m_solutionViewed.height ? OrientationType.PORTRAIT : OrientationType.LANDSCAPE;
    }

    protected onCanvasResize() {
        this.onCanvasCurrent();
        this.onCameraOrthoHeight();
        this.onCameraRectScreen();
        if (this.RectDebug && sys.os == sys.OS.WINDOWS) {
            console.log('=============');
            console.log('Canvas resize:');
            console.log('Orientation: ' + (this.m_orientation == OrientationType.LANDSCAPE ? 'LANDSCAPE' : 'PORTRAIT'));
            console.log('Solution target: [' + this.m_solutionTarget.x + ';' + this.m_solutionTarget.y + ']');
            console.log('Solution viewed: [' + this.m_solutionViewed.x + ';' + this.m_solutionViewed.y + ']');
            console.log('Camera Rect: ' + this.m_camera.rect);
            console.log('=============');
        }
    }

    //OTHOR

    protected onCameraOrthoHeight() {
        if (!this.OrthoScreen)
            return;
        switch (this.m_orientation) {
            case OrientationType.PORTRAIT:
                this.m_camera.orthoHeight = (this.m_orthoHeight * this.OrthoPortrait) * this.Scale;
                break;
            case OrientationType.LANDSCAPE:
                this.m_camera.orthoHeight = (this.m_orthoHeight * this.OrthoLandscape) * this.Scale;
                break;
        }
    }

    //RECT

    protected onCameraRectScreen() {
        if (!this.RectScreen)
            return;
        let rect = new Rect(0, 0, 1, 1);
        let ratioWidth = 1.0 * this.m_solutionTarget.x / this.m_solutionViewed.x;
        if (ratioWidth < 1) {
            rect.x = (1.0 - ratioWidth) / 2;
            rect.width = ratioWidth;
        }
        let ratioHeight = 1.0 * this.m_solutionTarget.y / this.m_solutionViewed.y;
        if (ratioHeight < 1) {
            rect.y = (1.0 - ratioHeight) / 2;
            rect.height = ratioHeight;
        }
        switch (this.m_orientation) {
            case OrientationType.PORTRAIT:
                if (!this.RectPortraitFixed)
                    break;
                rect.x = this.RectPortrait.x;
                rect.width = this.RectPortrait.width;
                rect.y = this.RectPortrait.y;
                rect.height = this.RectPortrait.height;
                break;
            case OrientationType.LANDSCAPE:
                if (!this.RectLandScapeFixed)
                    break;
                rect.x = this.RectLandscape.x;
                rect.width = this.RectLandscape.width;
                rect.y = this.RectLandscape.y;
                rect.height = this.RectLandscape.height;
                break;
        }
        this.m_camera.rect = rect;
    }

    //SMOOTH

    onSmoothTime(smoothTime: number) {
        this.SmoothTime = smoothTime;
    }

    //SCALE

    onScale(scale: number) {
        this.Scale = scale;
        this.onCameraOrthoHeight();
    }

    onScaleTween(scale: number, duration: number, easing: TweenEasing) {
        if (duration == null || easing == null) {
            this.onScale(scale);
            return;
        }
        if (this.m_tweenScale != null)
            Tween.stopAllByTarget(this.m_tweenScale);
        this.m_tweenScale = new NodeTweener();
        this.m_tweenScale.Base = this;
        this.m_tweenScale.Value = this.Scale;
        tween(this.m_tweenScale)
            .to(duration, { Value: scale }, {
                easing: easing,
                onUpdate(Info: NodeTweener) {
                    Info.Base.Scale = Info.Value;
                    Info.Base.onCameraOrthoHeight();
                },
            })
            .start();
    }

    //OFFSET

    onOffset(offset: Vec2) {
        this.Offset = offset;
    }

    onOffsetTween(offset: Vec2, duration: number, easing: TweenEasing) {
        if (duration == null || easing == null) {
            this.onOffset(offset);
            return;
        }
        if (this.m_tweenOffset != null)
            Tween.stopAllByTarget(this.m_tweenOffset);
        this.m_tweenOffset = new NodeTweener();
        this.m_tweenOffset.Base = this;
        this.m_tweenOffset.Value = this.Offset.multiplyScalar(1.0);
        tween(this.m_tweenOffset)
            .to(duration, { Value: offset }, {
                easing: easing,
                onUpdate(Info: NodeTweener) {
                    Info.Base.Offset = Info.Value;
                    Info.Base.Offset = Info.Value;
                },
            })
            .start();
    }

    //SWITCH

    onSwitch(Target: Node) {
        if (this.m_tweenSwitch != null)
            Tween.stopAllByTarget(this.m_tweenSwitch);
        if (this.SwitchTween) {
            this.onSwitchTween(Target, this.SwitchTweenDuration, EaseType[this.SwitchTweenEasing] as TweenEasing);
            return;
        }
        this.Target = Target;
        this.m_posTarget = Target.worldPosition.clone();
    }

    onSwitchTween(target: Node, duration: number, easing: TweenEasing) {
        if (duration == null || easing == null) {
            this.onSwitch(target);
            return;
        }
        if (this.m_tweenSwitch != null)
            Tween.stopAllByTarget(this.m_tweenSwitch);
        this.Target = target;
        this.m_posTarget = target.worldPosition.clone();

        this.m_update = false; // Stop Update

        if (this.LockX)
            this.m_posTarget.x = this.m_lock.x;
        if (this.LockY)
            this.m_posTarget.y = this.m_lock.y;

        this.m_posCurrent = this.m_posTarget.clone(); // After complete tween, set current position to target position to avoid double lerp

        this.m_tweenSwitch = new NodeTweener();
        this.m_tweenSwitch.Base = this;
        this.m_tweenSwitch.Value = this.node.worldPosition;
        tween(this.m_tweenSwitch)
            .to(duration, { Value: this.m_posTarget }, {
                easing: easing,
                onUpdate(Info: NodeTweener) {
                    Info.Base.node.worldPosition = Info.Value;
                },
                onComplete(Info: NodeTweener) {
                    Info.Base.m_update = true; // Continue Update
                }
            })
            .start();
    }

    //SHAKE

    onShake(stage: boolean) {
        if (this.m_shake == stage)
            return;
        this.m_shake = stage;
        if (stage) {
            if (this.m_tweenShake != null)
                this.m_tweenShake.start();
            else {
                let rotate1 = tween(this.node).to(0.025, { eulerAngles: v3(0, 0, 0.5) });
                let rotate2 = tween(this.node).to(0.025, { eulerAngles: v3(0, 0, -0.5) });
                this.m_tweenShake = tween(this.node).sequence(rotate1, rotate2).repeatForever().start();
            }
        }
        else if (this.m_tweenShake != null) {
            this.m_tweenShake.stop();
            this.node.setRotationFromEuler(v3(0, 0, 0));
        }
    }

    onShakeOnce() {
        if (this.m_tweenShakeOnce != null)
            this.m_tweenShakeOnce.start();
        else {
            let rotate1 = tween(this.node).to(0.025, { eulerAngles: v3(0, 0, 0.5) });
            let rotate2 = tween(this.node).to(0.025, { eulerAngles: v3(0, 0, -0.5) });
            this.m_tweenShakeOnce = tween(this.node).sequence(rotate1, rotate2).start();
        }
    }
}
