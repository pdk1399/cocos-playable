import { _decorator, Component, math, Node, v2, Vec2, view, screen, CCBoolean, Rect } from 'cc';
import { Responsive2D } from 'db://responsive2d/Responsive2D';
import { ConstantBase } from '../ConstantBase';
import CameraBase from '../camera/CameraBase';
const { ccclass, property } = _decorator;

export enum OrientationType {
    PORTRAIT,
    LANDSCAPE,
}

@ccclass('UiReponsive2DVerticle')
export class UiReponsive2DVerticle extends Component {

    @property(CCBoolean)
    RevertSpace: boolean = false;

    m_orientation = OrientationType.LANDSCAPE;
    m_solution: math.Size;
    m_view: Vec2;
    m_solutionViewed: math.Size;

    m_reponsive: Responsive2D;

    protected onLoad(): void {
        this.m_reponsive = this.getComponent(Responsive2D);
    }

    protected start(): void {
        //NOTE: This event must add from Start to get event!
        view.on('canvas-resize', () => {
            this.onCanvasResize();
        });
        this.onCanvasCurrent();
        this.onReposiveChange();
    }

    //

    protected onCanvasCurrent() {
        this.m_solution = screen.windowSize.clone();
        this.m_view = v2(view.getScaleX(), view.getScaleY());
        this.m_solutionViewed = new math.Size(this.m_solution.width / this.m_view.x, this.m_solution.height / this.m_view.y);
        this.m_orientation = this.m_solutionViewed.width < this.m_solutionViewed.height ? OrientationType.PORTRAIT : OrientationType.LANDSCAPE;
    }

    protected onCanvasResize() {
        this.onCanvasCurrent();
        this.onReposiveChange();
    }

    //

    protected onReposiveChange() {
        switch (this.m_orientation) {
            case OrientationType.PORTRAIT:
                //Space
                if (CameraBase.instance.RectPortraitFixed) {
                    this.m_reponsive.portraitHorSpace = 0;
                    this.m_reponsive.portraitVerSpace = CameraBase.instance.RectPortrait.y * 100;
                } else {
                    let ratioHeight = 1.0 * ConstantBase.SOLUTION_LANDSCAPE.y / this.m_solutionViewed.y;
                    if (ratioHeight < 1) {
                        this.m_reponsive.portraitHorSpace = 0;
                        this.m_reponsive.portraitVerSpace = (((1.0 - ratioHeight) / 2) * 100) * (this.RevertSpace ? -1 : 1);
                    }
                    else {
                        this.m_reponsive.portraitHorSpace = 0;
                        this.m_reponsive.portraitVerSpace = 0;
                    }
                }
                //Ratio
                this.m_reponsive.portraitWidthRatio = 1;
                break;
            case OrientationType.LANDSCAPE:
                //Space
                if (CameraBase.instance.RectPortraitFixed) {
                    this.m_reponsive.landscapeHorSpace = 0;
                    this.m_reponsive.landscapeVerSpace = CameraBase.instance.RectLandscape.y * 100;
                } else {
                    let ratioHeight = 1.0 * ConstantBase.SOLUTION_LANDSCAPE.y / this.m_solutionViewed.y;
                    if (ratioHeight < 1) {
                        this.m_reponsive.landscapeHorSpace = 0;
                        this.m_reponsive.landscapeVerSpace = ((1.0 - ratioHeight) / 2) * 100;
                    }
                    else {
                        this.m_reponsive.landscapeHorSpace = 0;
                        this.m_reponsive.landscapeVerSpace = 0;
                    }
                }
                //Ratio
                if (CameraBase.instance.RectPortraitFixed)
                    this.m_reponsive.landscapeWidthRatio = CameraBase.instance.RectLandscape.width;
                else {
                    let ratioWidth = 1.0 * ConstantBase.SOLUTION_LANDSCAPE.x / this.m_solutionViewed.x;
                    if (ratioWidth < 1) {
                        this.m_reponsive.landscapeWidthRatio = ratioWidth;
                    }
                    else {
                        this.m_reponsive.landscapeWidthRatio = 1;
                    }
                }
                break;
        }
    }
}