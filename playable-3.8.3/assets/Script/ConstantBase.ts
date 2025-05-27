import { _decorator, Enum, v2, Vec2 } from 'cc';

export class ConstantBase {

    static readonly SOLUTION_LANDSCAPE: Vec2 = v2(1920, 1080);
    static readonly SOLUTION_PORTRAIT: Vec2 = v2(1080, 1920);

    //

    static readonly PLAYER_COMPLETE: string = 'player-complete';
    static readonly PLAYER_DEAD: string = 'player-dead';

    static readonly GAME_COMPLETE: string = 'game-complete';
    static readonly GAME_LOSE: string = 'game-lose';
    static readonly GAME_TIME_OUT: string = 'game-time-out';

    static readonly DIRECT_STORE: string = 'direct-store';
    static readonly DIRECT_PRESS: string = 'direct-press';

    //

    static readonly CONTROL_LOCK: string = 'control-lock';
    static readonly CONTROL_RESUME: string = 'control-resume';

    static readonly CONTROL_UP: string = 'control-up';
    static readonly CONTROL_DOWN: string = 'control-down';
    static readonly CONTROL_LEFT: string = 'control-left';
    static readonly CONTROL_RIGHT: string = 'control-right';
    static readonly CONTROL_JOY_STICK: string = 'control-joy-stick';
    static readonly CONTROL_RELEASE: string = 'control-release';
    static readonly CONTROL_RELEASE_X: string = 'control-release-x';
    static readonly CONTROL_RELEASE_Y: string = 'control-release-y';
    static readonly CONTROL_JUMP: string = 'control-jump';
    static readonly CONTROL_JUMP_RELEASE: string = 'control-jump-release';
    static readonly CONTROL_DASH: string = 'control-dash';
    static readonly CONTROL_INTERACTION: string = 'control-interaction';
    static readonly CONTROL_FIXED: string = 'control-fixed';
    static readonly CONTROL_SWITCH: string = 'control-switch';
    static readonly CONTROL_ATTACK: string = 'control-attack';

    //

    static readonly NODE_EVENT: string = 'node-event'; // Used in most of quick-events in Nodes

    static readonly NODE_BODY_HIT: string = 'node-body-hit';
    static readonly NODE_BODY_DEAD: string = 'node-body-dead';
    static readonly NODE_BODY_X2: string = 'node-body-x2';
    static readonly NODE_BODY_X4: string = 'node-body-x4';
    static readonly NODE_BODY_SINKING: string = 'node-body-sinking';

    static readonly NODE_COLLIDE_BODY: string = 'node-collide-collide';
    static readonly NODE_COLLIDE_BOT: string = 'node-collide-bot';
    static readonly NODE_COLLIDE_INTERACTE: string = 'node-collide-interacte';

    static readonly NODE_CONTROL_FACE_X_RIGHT: string = 'node-control-face-x-right';
    static readonly NODE_CONTROL_FACE_X_LEFT: string = 'node-control-face-x-left';
    static readonly NODE_CONTROL_FACE_X_REVERSE: string = 'node-control-face-x-reverse';
    static readonly NODE_CONTROL_FACE_Y_UP: string = 'node-control-face-y-up';
    static readonly NODE_CONTROL_FACE_Y_DOWN: string = 'node-control-face-y-down';
    static readonly NODE_CONTROL_FACE_Y_REVERSE: string = 'node-control-face-y-reverse';

    static readonly NODE_CONTROL_DIRECTOR: string = 'node-control-director';
    static readonly NODE_CONTROL_NODE: string = 'node-control-node';
    static readonly NODE_CONTROL_SLEEP: string = 'node-control-sleep';
    static readonly NODE_CONTROL_AWAKE: string = 'node-control-awake';

    static readonly NODE_PICK: string = 'node-pick';
    static readonly NODE_THROW: string = 'node-throw';

    static readonly NODE_ATTACK_MELEE_FOUND: string = 'node-attack-melee-found';
    static readonly NODE_ATTACK_RANGE_FOUND: string = 'node-attack-range-found';
    static readonly NODE_ATTACK_ULTIMATE: string = 'node-body-attack-ultimate';

    static readonly NODE_VALUE: string = 'node-value'; // Used to help value-event excute it's child event
    static readonly NODE_VALUE_PROTECT: string = 'node-value-protect';
    static readonly NODE_VALUE_HIT_POINT: string = 'node-value-hit-point';
    static readonly NODE_VALUE_HIT_POINT_CURRENT: string = 'node-value-hit-point-current';
    static readonly NODE_VALUE_LOCK_X: string = 'node-value-lock-x';
    static readonly NODE_VALUE_LOCK_Y: string = 'node-value-lock-y';
    static readonly NODE_VALUE_LOCK_ROTATE: string = 'node-value-lock-rotate';
    static readonly NODE_VALUE_MOVE_GROUND: string = 'node-value-move-ground';
    static readonly NODE_VALUE_MOVE_JUMP: string = 'node-value-move-jump';
    static readonly NODE_VALUE_MELEE_HIT: string = 'node-value-melee-hit';

    static readonly NODE_STOP: string = 'node-stop';

    static readonly NODE_STATE: string = 'node-state';
    static readonly NODE_STATE_LOCK: string = 'node-state-lock';

    static readonly NODE_UI_DRAG_ENTER: string = 'node-ui-drag-enter';
    static readonly NODE_UI_DRAG_BACK: string = 'node-ui-drag-back';
    static readonly NODE_UI_DRAG_EXIT: string = 'node-ui-drag-exit';

    //

    static readonly ANIM_INDEX_ATTACK: number = 1;
    static readonly ANIM_INDEX_PICK: number = 1;
    static readonly ANIM_INDEX_AIM: number = 2;

    //

    static readonly UI_ATTACK_SHOW: string = 'ui-attack-show';
    static readonly UI_INTERACTION_SHOW: string = 'ui-interaction-show';
    static readonly UI_INTERACTION_ICON: string = 'ui-interaction-icon';

    //

    static readonly CAMERA_SMOOTH_TIME: string = 'camera-smooth-time';
    static readonly CAMERA_SCALE: string = 'camera-scale';
    static readonly CAMERA_OFFSET: string = 'camera-offset';
    static readonly CAMERA_SWITCH: string = 'camera-switch';
    static readonly CAMERA_EFFECT_SHAKE: string = 'camera-effect-shake';
    static readonly CAMERA_EFFECT_SHAKE_ONCE: string = 'camera-effect-shake-once';

    //STICK-BATTLE

    static readonly BATTLE_START: string = 'battle-start';
    static readonly BATTLE_END: string = 'battle-end';
    static readonly BATTLE_START_COUNTDOWN: string = 'battle-start-countdown';
    static readonly STICK_BLUE_DEAD: string = 'stick-blue-dead';
    static readonly STICK_RED_DEAD: string = 'stick-red-dead';

    static readonly TAG_FIELD_RENDERER: number = 10;
    static readonly TAG_FIELD_BODY: number = 100;
    static readonly TAG_FIELD_RANGE: number = 101;
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