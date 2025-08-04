import { _decorator, CCInteger, CCString, Component, Enum, math, Node } from 'cc';
import { SpineBase } from '../../renderer/SpineBase';
const { ccclass, property } = _decorator;

enum StickBattleUnitType {
    None = 0,
    Sword = 1,
    Defender = 2,
    Pikemanm = 3,
    Gunner = 4,
    Viking = 5,
    Ninja = 6,
}
Enum(StickBattleUnitType);

@ccclass('StickBattleUnit')
export class StickBattleUnit extends Component {

    @property({ group: { name: 'Unit' }, type: StickBattleUnitType })
    type: StickBattleUnitType = StickBattleUnitType.None;
    @property({ group: { name: 'Unit' }, type: CCInteger })
    level: number = 0;
    @property({ group: { name: 'Unit' }, type: SpineBase })
    spine: SpineBase = null;
    @property({ group: { name: 'Unit' }, type: [CCString] })
    levelSkin: string[] = [];
    @property({ group: { name: 'Unit' }, type: [CCString] })
    levelSkinMix: string[] = [];

    protected onLoad(): void {
        while (this.levelSkinMix.length < this.levelSkin.length) this.levelSkinMix.push("");
        this.level = math.clamp(this.level, 0, this.levelSkin.length);
        this.spine.onSkin(this.levelSkin[this.level], this.levelSkinMix[this.level]);
    }

    onLevelAdd(value: number = 1): boolean {
        if (this.level >= this.levelSkin.length - 1)
            return false;
        this.level += value;
        this.level = math.clamp(this.level, 0, this.levelSkin.length - 1);
        this.spine.onSkin(this.levelSkin[this.level], this.levelSkinMix[this.level]);
        return true;
    }
}