import { _decorator, Enum, v2, Vec2 } from 'cc';

export class ConstantBase {

    static readonly SOLUTION_TARGET: Vec2 = v2(1920, 1080);

    //

    static readonly GAME_COMPLETE: string = 'game-complete';
    static readonly GAME_LOSE: string = 'game-lose';
    static readonly GAME_TIME_OUT: string = 'game-time-out';

    static readonly DIRECT_STORE: string = 'direct-store';
    static readonly DIRECT_PRESS: string = 'direct-press';

    //

    static readonly CONTROL_LOCK: string = 'control-lock';
    static readonly CONTROL_RESUME: string = 'control-resume';

    static readonly CONTROL_LEFT: string = 'control-move-left';
    static readonly CONTROL_RIGHT: string = 'control-move-right';
    static readonly CONTROL_UP: string = 'control-up';
    static readonly CONTROL_DOWN: string = 'control-down';
    static readonly CONTROL_RELEASE: string = 'control-move-release';
    static readonly CONTROL_RELEASE_X: string = 'control-move-release-x';
    static readonly CONTROL_RELEASE_Y: string = 'control-move-release-y';
    static readonly CONTROL_JUMP: string = 'control-jump';
    static readonly CONTROL_JUMP_RELEASE: string = 'control-jump-release';
    static readonly CONTROL_DASH: string = 'control-dash';
    static readonly CONTROL_JOY_STICK: string = 'control-joy-stick';
    static readonly CONTROL_ATTACK: string = 'control-attack';
    static readonly CONTROL_INTERACTION: string = 'control-interaction';
    static readonly CONTROL_FIXED: string = 'control-fixed';
    static readonly CONTROL_SWITCH: string = 'control-switch';

    static readonly INPUT_ATTACK_SHOW: string = 'input-attack-show';
    static readonly INPUT_INTERACTION_SHOW: string = 'input-interaction-show';
    static readonly INPUT_INTERACTION_ICON: string = 'input-interaction-icon';

    //

    static readonly BODY_SLEEP: string = 'body-sleep';
    static readonly BODY_AWAKE: string = 'body-awake';

    static readonly BODY_X2 = 'body-x2';
    static readonly BODY_X4 = 'body-x4';
    static readonly BODY_ATTACK_UP = 'body-attack-up';
    static readonly BODY_BUBBLE_CELESTE = 'body-bubble-celeste';

    static readonly CAMERA_TARGET_SWITCH: string = 'camera-target-switch';
    static readonly CAMERA_VALUE_SMOOTH_TIME: string = 'camera-value-smooth-time';
    static readonly CAMERA_VALUE_OFFSET: string = 'camera-value-offset';
    static readonly CAMERA_VALUE_SCALE: string = 'camera-value-scale';
    static readonly CAMERA_EFFECT_SHAKE: string = 'camera-effect-shake';
    static readonly CAMERA_EFFECT_SHAKE_ONCE: string = 'camera-effect-shake-once';

    static readonly PLAYER_COMPLETE: string = 'player-complete';
    static readonly PLAYER_DEAD: string = 'player-dead';
    static readonly PLAYER_REVIVE: string = 'player-revive';
    static readonly PLAYER_GROUND = 'player-ground';
    static readonly PLAYER_HURT = 'player-hurt';
    static readonly PLAYER_KNOCK = 'player-knock';

    //

    static readonly PLAYER_VALUE_ATTACK: string = 'player-value-attack';
    static readonly PLAYER_VALUE_MOVE_X: string = 'player-value-move-x';
    static readonly PLAYER_VALUE_DAMP_X: string = 'player-value-damp-x';
    static readonly PLAYER_VALUE_AIR_X: string = 'player-value-air-x';
    static readonly PLAYER_VALUE_JUMP_Y: string = 'player-value-jump-y';
    static readonly PLAYER_VALUE_GRAVITY: string = 'player-value-gravity';
    static readonly PLAYER_VALUE_HEALTH: string = 'player-value-health';

    //

    static readonly NODE_STOP = 'node-stop';

    static readonly NODE_STATE = 'node-state';
    static readonly NODE_STATE_LOCK = 'node-state-lock';

    static readonly NODE_EVENT = 'node-event';

    static readonly NODE_BODY_HIT = 'node-body-hit';
    static readonly NODE_BODY_DEAD = 'node-body-dead';

    static readonly NODE_CONTROL_DIRECTOR = 'node-control-director';
    static readonly NODE_CONTROL_NODE = 'node-control-node';

    static readonly NODE_PICK = 'node-pick';
    static readonly NODE_THROW = 'node-throw';

    //

    static readonly ANIM_INDEX_ATTACK: number = 1;
    static readonly ANIM_INDEX_PICK: number = 1;
    static readonly ANIM_INDEX_AIM: number = 2;
}

export enum EaseType {
    linear,
    smooth,
    fade,
    constant,
    quadIn,
    quadOut,
    quadInOut,
    quadOutIn,
    cubicIn,
    cubicOut,
    cubicInOut,
    cubicOutIn,
    quartIn,
    quartOut,
    quartInOut,
    quartOutIn,
    quintIn,
    quintOut,
    quintInOut,
    quintOutIn,
    sineIn,
    sineOut,
    sineInOut,
    sineOutIn,
    expoIn,
    expoOut,
    expoInOut,
    expoOutIn,
    circIn,
    circOut,
    circInOut,
    circOutIn,
    elasticIn,
    elasticOut,
    elasticInOut,
    elasticOutIn,
    backIn,
    backOut,
    backInOut,
    backOutIn,
    bounceIn,
    bounceOut,
    bounceInOut,
    bounceOutIn,
}
Enum(EaseType); //Enum value was copy from 'cc.d.ts' library script of 'TweenEasing' list

export enum FontType {
    Arial,
    TimesNewRoman,
    Verdana,
    Tahoma,
    ComicSansMS,
    TrebuchetMS,
    Impact,
    Georgia,
    CourierNew,
    SegoeUI,
    Calibri,
    Roboto,
}
Enum(FontType);

export enum KeyCodeType {
    NONE = 0,
    MOBILE_BACK = 6,
    BACKSPACE = 8,
    TAB = 9,
    ENTER = 13,
    SHIFT_LEFT = 16,
    CTRL_LEFT = 17,
    ALT_LEFT = 18,
    PAUSE = 19,
    CAPS_LOCK = 20,
    ESCAPE = 27,
    SPACE = 32,
    PAGE_UP = 33,
    PAGE_DOWN = 34,
    END = 35,
    HOME = 36,
    ARROW_LEFT = 37,
    ARROW_UP = 38,
    ARROW_RIGHT = 39,
    ARROW_DOWN = 40,
    INSERT = 45,
    DELETE = 46,
    DIGIT_0 = 48,
    DIGIT_1 = 49,
    DIGIT_2 = 50,
    DIGIT_3 = 51,
    DIGIT_4 = 52,
    DIGIT_5 = 53,
    DIGIT_6 = 54,
    DIGIT_7 = 55,
    DIGIT_8 = 56,
    DIGIT_9 = 57,
    KEY_A = 65,
    KEY_B = 66,
    KEY_C = 67,
    KEY_D = 68,
    KEY_E = 69,
    KEY_F = 70,
    KEY_G = 71,
    KEY_H = 72,
    KEY_I = 73,
    KEY_J = 74,
    KEY_K = 75,
    KEY_L = 76,
    KEY_M = 77,
    KEY_N = 78,
    KEY_O = 79,
    KEY_P = 80,
    KEY_Q = 81,
    KEY_R = 82,
    KEY_S = 83,
    KEY_T = 84,
    KEY_U = 85,
    KEY_V = 86,
    KEY_W = 87,
    KEY_X = 88,
    KEY_Y = 89,
    KEY_Z = 90,
    NUM_0 = 96,
    NUM_1 = 97,
    NUM_2 = 98,
    NUM_3 = 99,
    NUM_4 = 100,
    NUM_5 = 101,
    NUM_6 = 102,
    NUM_7 = 103,
    NUM_8 = 104,
    NUM_9 = 105,
    /**The numeric keypad '*'*/
    NUM_MULTIPLY = 106,
    /**The numeric keypad '+'*/
    NUM_PLUS = 107,
    /**The numeric keypad '-'*/
    NUM_SUBTRACT = 109,
    /**The numeric keypad '.'*/
    NUM_DECIMAL = 110,
    /**The numeric keypad '/'*/
    NUM_DIVIDE = 111,
    F1 = 112,
    F2 = 113,
    F3 = 114,
    F4 = 115,
    F5 = 116,
    F6 = 117,
    F7 = 118,
    F8 = 119,
    F9 = 120,
    F10 = 121,
    F11 = 122,
    F12 = 123,
    NUM_LOCK = 144,
    SCROLL_LOCK = 145,
    /**The ';' key.*/
    SEMICOLON = 186,
    /**The '=' key.*/
    EQUAL = 187,
    /**The ',' key.*/
    COMMA = 188,
    /**The dash '-' key.*/
    DASH = 189,
    /**The '.' key*/
    PERIOD = 190,
    /**The slash key '/'*/
    SLASH = 191,
    /**The back quote key `*/
    BACK_QUOTE = 192,
    /**The '[' key*/
    BRACKET_LEFT = 219,
    /**The back slash key '\'*/
    BACKSLASH = 220,
    /**The ']' key*/
    BRACKET_RIGHT = 221,
    /**The quote key*/
    QUOTE = 222,
    /**The right shift key*/
    SHIFT_RIGHT = 2000,
    /**The right ctrl key*/
    CTRL_RIGHT = 2001,
    /**The right alt key*/
    ALT_RIGHT = 2002,
    /**The numeric keypad enter*/
    NUM_ENTER = 2003
}
Enum(KeyCodeType); //Enum value was copy from 'cc.d.ts' library script of 'KeyCode' enum