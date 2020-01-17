"use strict";
/**
 * 所使用的的函数式方法有：
 * helper.ts中：memorize、curry、
 * reversi.ts中：map、reduce、foreach、every、filter、curry、curry_2、bind、compose、pipe、monads、maybe functor
 *  */
exports.__esModule = true;
var helper_1 = require("./helper");
var rl = require('readline-sync');
var fs = require('fs');
/**
 * 0-未放置棋子，1-黑棋，2-白旗
 *  */
var Color;
(function (Color) {
    Color[Color["BLACK"] = 1] = "BLACK";
    Color[Color["WHITE"] = -1] = "WHITE";
    Color[Color["EMPTY"] = 0] = "EMPTY";
})(Color || (Color = {}));
//棋盘全零初始化
var board_zoro_init = function (dim) {
    var init_position = dim / 2 - 1;
    var board = new Array();
    for (var i = 0; i < dim; ++i) {
        board.push([]);
        for (var j = 0; j < dim; ++j) {
            board[i][j] = Color.EMPTY;
        }
    }
    return board;
};
//棋盘状态初始化
var checkerboard_init = function (dim) {
    var board = board_zoro_init(dim);
    var init_position = dim / 2 - 1;
    board[init_position][init_position] = Color.WHITE;
    board[init_position][init_position + 1] = Color.BLACK;
    board[init_position + 1][init_position] = Color.BLACK;
    board[init_position + 1][init_position + 1] = Color.WHITE;
    return board;
};
/**
 * 打印棋盘状态。
 * 抽取函数中的固定模式为单一函数，使用map代替显式的for循环，使得代码简洁易读，
 * 使用了forEach函数遍历数组，代码精简，无副作用，可读性强
 * */
var print_checkerboard = function (checkerboard) {
    var str_for_print = "";
    str_for_print += "\t";
    str_for_print += helper_1.range("a".charCodeAt(0), "a".charCodeAt(0) + checkerboard.length).map(//map
    function (value) { return String.fromCharCode(value); }).join("\t");
    console.log(str_for_print);
    checkerboard.forEach(function (x, index) {
        console.log(num2char(index) + '\t' + x.map(function (x) { return x === Color.EMPTY ? ' ' : x === Color.BLACK ? 'X' : 'O'; }).join('\t') + '\n\n');
    });
    return checkerboard;
};
// 棋子是否落在棋盘内
var in_checkerboard = function (checkerboard, p) {
    return p.y >= 0 && p.x >= 0 && p.x < checkerboard.length && p.y < checkerboard.length;
};
//当前位置是否已落子
var isOccupied = function (checkerboard, piece) {
    return checkerboard[piece.x][piece.y] != Color.EMPTY;
};
/**
 * 计算当前位置落子得分。
 * 使用foreach函数遍历数组，代码精简、易读、无副作用
 * */
var cal_score = function (checkerboard, piece) {
    var offset_x = [-1, 0, 1];
    var offset_y = [-1, 0, 1];
    var score = 0;
    var reversi_pieces = [];
    offset_x.forEach(function (dx) {
        offset_y.forEach(function (dy) {
            var x = piece.x + dx;
            var y = piece.y + dy;
            if (!(dx === 0 && dy === 0) && in_checkerboard(checkerboard, { x: x, y: y, color: piece.color })) {
                var temp_score = 0;
                while (piece.color + checkerboard[x][y] === 0) { // 得到最长直线
                    x += dx;
                    y += dy;
                    if (!in_checkerboard(checkerboard, { x: x, y: y, color: piece.color }))
                        break;
                    ++temp_score; // 最长直线长度
                }
                if (temp_score > 0 && in_checkerboard(checkerboard, { x: x, y: y, color: piece.color }) && Math.abs(piece.color + checkerboard[x][y]) === 2) { // 直线的另一端点是否为己方棋子(并且下一棋子必须不同，即分数大于0)
                    reversi_pieces.push({ x: x, y: y, color: piece.color });
                    score += temp_score; // 得分累加
                }
            }
        });
    });
    return { score: score, reversi_pieces: reversi_pieces };
};
/**
 * AI，计算AI策略。
 * 使用foreach函数遍历数组，代码精简、易读
 */
var AIplayer = function (checkerboard, color) {
    var res = { score: 0, reversi_pieces: undefined };
    var res_row = -1;
    var res_col = -1;
    checkerboard.forEach(function (row, row_index) {
        row.forEach(function (piece, col_index) {
            if (piece === Color.EMPTY) {
                var curr_res = cal_score(checkerboard, { x: row_index, y: col_index, color: color });
                if (curr_res.score > res.score) {
                    res = curr_res;
                    res_row = row_index;
                    res_col = col_index;
                }
            }
        });
    });
    return { src: { x: res_row, y: res_col, color: color }, result: res };
};
/**
 * 翻转棋子。
 * 使用foreach函数遍历数组，代码精简、易读、无副作用
 *  */
var revere_pieces = function (checkerboard, choice) {
    var src = choice.src;
    var result = choice.result;
    if (result.score === 0)
        return checkerboard; //没有需要翻转的棋子
    result.reversi_pieces.forEach(function (piece) {
        var dx = helper_1.range(src.x, piece.x);
        var dy = helper_1.range(src.y, piece.y);
        if (dx.length > 0 && dy.length > 0) { //翻转对角线上棋子
            helper_1.zip(dx, dy).forEach(function (p) {
                checkerboard[p[0]][p[1]] = src.color;
            });
        }
        else { //翻转上下左右棋子
            var index = 0;
            var len = dx.length > dy.length ? dx.length : dy.length;
            while (index < len) {
                var x = dx.length === 0 ? src.x : dx[index];
                var y = dy.length === 0 ? src.y : dy[index];
                checkerboard[x][y] = src.color;
                ++index;
            }
        }
    });
    return checkerboard;
};
// 数字转字母
var num2char = function (num) {
    return String.fromCharCode("a".charCodeAt(0) + num);
};
// 输出AI决策
var prinit_ai_choice = function (ai_choice) {
    var log_info = "";
    if (ai_choice.result.score > 0)
        log_info = 'Computer places ' + (ai_choice.src.color === Color.BLACK ? 'X' : 'O') + ' at '
            + num2char(ai_choice.src.x) + num2char(ai_choice.src.y);
    else
        log_info = (ai_choice.src.color === Color.BLACK ? 'X' : 'O') + ' player has no valid move.';
    mLog2console(log_info);
    return ai_choice;
};
/***
 * 棋盘是否满了？
 * 使用map遍历并操作数组，避免了显式循环遍历数组，精简了代码，代码具有较好的可读性
 * 使用every 对数组是否满足某一条件进行判断，使得显式循环消失，代码精简
 * */
var isfull = function (checkerboard) {
    return checkerboard.map(// map
    function (x) { return x.every(// every
    function (x) { return Math.abs(x) === 1; }); }).every(function (x) { return x; }); //every  
};
/***
 * 是否仅剩一方棋子？
 * 使用map、every操作、遍历数组，避免了显式循环遍历数组，精简了代码，代码具有较好的可读性
 * */
var only_one = function (checkerboard) {
    return (
    // 全黑
    checkerboard.map(// map
    function (x) { return x.every(function (x) { return x === Color.BLACK ? true : false; }); })
        .every(function (x) { return x ? true : false; })
        || // 全白
            checkerboard.map(// map
            function (x) { return x.every(// every
            function (x) { return x === Color.WHITE ? true : false; }); })
                .every(// every
            function (// every
            x) { return x ? true : false; }));
};
/***
 * 双方均无落子位置
 * 使用every遍历数组，避免了显式循环遍历数组，精简了代码，代码具有较好的可读性
 * 使用monads向控制台输出信息和记录操作日志，便于调试和避免代码的side effect
 * */
var no_more = function (checkerboard) {
    if ([AIplayer(checkerboard, Color.BLACK).result.score,
        AIplayer(checkerboard, Color.WHITE).result.score]
        .every(function (x) { return x === 0; })) { //every
        mLog2console("Both players have no valid move."); //mondas
        return true;
    }
    return false;
};
/***
 * 游戏结束？
 * 使用reduce遍历数组，避免了显式循环遍历数组，精简了代码，代码具有较好的可读性
 * */
var game_over = function (checkerboard) {
    return [
        isfull(checkerboard),
        only_one(checkerboard),
        no_more(checkerboard) // 双方均无落子位置
    ].reduce(// reduce 
    function (pre, cur) { return pre || cur; }, false);
};
// 博弈
var run = function (checkerboard, palyer1, player2) {
    var invalid_input = false;
    while (true) {
        if (palyer1(checkerboard) === false) {
            invalid_input = true;
            break;
        } //输入位置不合法提前结束游戏
        if (game_over(checkerboard))
            break; // 游戏正常结束
        if (player2(checkerboard) === false) {
            invalid_input = true;
            break;
        }
        ; //输入位置不合法提前结束游戏
        if (game_over(checkerboard))
            break;
        // 两名玩家都无可落子位置
    }
    return invalid_input;
};
/***
 * 游戏结束，得分清算。
 * 使用map遍历操作数组元素，避免了显式循环遍历数组，精简了代码，代码具有较好的可读性
 * 使用filter取出特定颜色的棋子，避免了显式循环遍历棋盘，精简了代码，代码具有较好的可读性
 * 通过找到固定的模式，把固定模式写为函数，使用reduce遍历数组，避免了显式循环遍历数组，精简了代码，代码具有较好的可读性
 * */
var score_clearing = function (checkerboard, color) {
    return checkerboard.map(// map
    function (x) { return x.filter(function (value) { return value === color; }) // filter
        .map(Math.abs) // map
        .reduce(helper_1.add, 0); } //reduce
    ).reduce(helper_1.add, 0); // reduce
};
// 谁赢了？
var who_win = function (checkerboard, pc_color, invalid_input) {
    if (invalid_input) {
        return "Game over.\n" + (pc_color === Color.BLACK ? 'X' : 'O') + " player wins.";
    }
    else {
        var player1_score = score_clearing(checkerboard, Color.BLACK);
        var player2_score = score_clearing(checkerboard, Color.WHITE);
        return "Game over.\nX : O = " + player1_score.toString() + ' : ' + player2_score.toString() + '.\n'
            + ((player1_score === player2_score) ? 'Draw' :
                ((player1_score > player2_score) ? 'X' : 'O') + ' player wins.\n');
    }
};
/***
 * 字符串转为坐标。
 * 使用maybe处理玩家输入的字符串，对非法值进行过滤并获取所出入的合法坐标，
 * 减少了对可能出现的异常情况的处理，专注于实现算法逻辑，也使得对输入坐标的处理代码更为直观明了；
 * 底层数据结构实现的细节被抽象出来。不需要知道是否需要迭代，也不需要知道迭代是如何处理的。
 * map空的functor和正常的functor是一样的，空集合的情况下不需要切换逻辑。
 * */
var str2coordinate = function (position) {
    return helper_1.Maybe.of(position).map(function (x) { return x.toLowerCase(); }).map(function (s) { return [s.charCodeAt(0), s.charCodeAt(1)].map((function (x) { return x - 'a'.charCodeAt(0); })); }).map(function (x) { return { x: x[0], y: x[1], color: Color.EMPTY }; })
        .filter(function (piece) { return piece.x >= 0 && piece.x < 26 && piece.y >= 0 && piece.y < 26; }).orElse({ x: -1, y: -1, color: Color.BLACK }); // 返回一个非法值
};
// 输入落子位置
var input_position = function (checkerboard, color) {
    var position = rl.question('Enter move for ' + (color === Color.BLACK ? 'X' : 'O') + ' (RowCol): ');
    var p = str2coordinate(position); //change
    if (!in_checkerboard(checkerboard, p) || isOccupied(checkerboard, p) || cal_score(checkerboard, { x: p.x, y: p.y, color: color }).score === 0)
        return false;
    return { x: p.x, y: p.y, color: color };
};
/***
 * 人类玩家。
 *  使用curry（curry_2），来预先设置函数的部分参数，使得二元函数及多元函数能够像一元函数那样compose、pipe
 * 使用pipe组合一系列对字符串的处理函数，使得函数的组合仅仅包含函数，对棋盘的操作流程清晰可见，阅读代码不需要关注所需传入的数据。
 * */
var human_palyer = function (checkerboard, color) {
    var pos = input_position(checkerboard, color);
    if (pos === false)
        return false; //输入位置不合法，返回false，结束游戏
    var _cal_score = helper_1.curry_2(cal_score)(pos); // curry_2
    return helper_1.pipe(// pipe
    _cal_score, helper_1.curry(function (src, result) { return { src: pos, result: result }; })(pos), // curry
    prinit_ai_choice, helper_1.curry(revere_pieces)(checkerboard), // curry
    print_checkerboard)(checkerboard);
};
/**
*得到对局结束日志
*使用monads包装对局结束日志信息，给定固定的输入，返回固定的输出，记录对日志的操作函数，便于调试和避免代码的side effect
* */
var mEnding_log = function (checkerboard, pc_color, invalid_input) {
    return helper_1.Writer.of("gameover", (invalid_input ? "Invalid move.\n" : "")
        + who_win(checkerboard, pc_color, invalid_input));
};
/**
*输出对局日志到CSV文件
*使用monads包装对局结束日志信息，给定固定的输入，返回固定的输出，记录对日志的操作函数，便于调试和避免代码的side effect
*monads还可以构成类型提升函数
* */
var mlog2CSV = function (pc_color, dim, start_time, log_info) {
    var end_time = Date.parse(new Date().toString());
    var csv_info = [];
    if (log_info.indexOf('Invalid') > -1) {
        csv_info = [
            formatDate(),
            ((end_time - start_time) / 1000).toString(),
            dim.toString() + "*" + dim.toString(),
            (pc_color === Color.BLACK ? "computer,human" : "human,computer"),
            "Human give up",
        ];
    }
    else {
        csv_info = [
            formatDate(),
            ((end_time - start_time) / 1000).toString(),
            dim.toString() + "*" + dim.toString(),
            (pc_color === Color.BLACK ? "computer,human" : "human,computer"),
            /[\d]+ : [\d]+/igm.exec(log_info)[0].replace(":", "to")
        ];
    }
    fs.writeFileSync('Reversi.csv', csv_info.join(",") + '\n', { flag: 'a' });
    return helper_1.Writer.of("Log to csv", "sucess");
};
// 日期格式化
var formatDate = function () {
    var Dates = new Date();
    var Year = Dates.getFullYear();
    var Month = (Dates.getMonth() + 1) < 10 ? '0' + (Dates.getMonth() + 1) : (Dates.getMonth() + 1);
    var Day = Dates.getDate() < 10 ? '0' + Dates.getDate() : Dates.getDate();
    var Hour = Dates.getHours() < 10 ? '0' + Dates.getHours() : Dates.getHours();
    var Minute = Dates.getMinutes() < 10 ? '0' + Dates.getMinutes() : Dates.getMinutes();
    var Second = Dates.getSeconds() < 10 ? '0' + Dates.getSeconds() : Dates.getSeconds();
    return Year + '-' + Month + '-' + Day + ' ' + Hour + ':' + Minute + ':' + Second;
};
/**
*输出对局信息到控制台
*使用monads包装输出日志信息，构成类型提升函数，记录对日志的操作函数，便于调试和避免代码的side effect
* */
var mLog2console = function (log_info) { return helper_1.Writer.of("console output:\n", console_print(log_info)); };
var console_print = function (x) {
    console.log(x);
    return x;
};
/***
 * 人机对决APP。
 * 使用curry（curry_2）、partial（bind），来预先设置函数的部分参数，使得二元函数及多元函数能够像一元函数那样compose、pipe
 * 使用compose组合一系列对棋盘的处理函数，使得函数的组合仅仅包含函数，对棋盘的操作流程清晰可见，阅读代码不需要关注所需传入的数据。
 * 使用monads包装输出日志信息，做类型提升、记录对日志的操作函数，便于调试和避免代码的side effect
 * */
var app = function (dimension, pc_color) {
    if (pc_color === void 0) { pc_color = Color.BLACK; }
    var start_time = Date.parse(new Date().toString());
    var checkerboard = helper_1.compose(// compose
    print_checkerboard, checkerboard_init)(dimension);
    var pc_palyer = helper_1.pipe(// pipe
    helper_1.curry_2(AIplayer)(pc_color), // curry
    prinit_ai_choice, helper_1.curry(revere_pieces)(checkerboard), // curry
    print_checkerboard);
    var _human_palyer = helper_1.curry_2(human_palyer)(-pc_color); // curry
    var invalid_input = pc_color === Color.BLACK ? run(checkerboard, pc_palyer, _human_palyer) : run(checkerboard, _human_palyer, pc_palyer);
    mEnding_log(checkerboard, pc_color, invalid_input) // monads
        .flatmap(mLog2console) // monads
        .flatmap(mlog2CSV.bind(null, pc_color, checkerboard.length, start_time)); // partial
};
/***
 * AI对决AI app。
 * 使用compose组合一系列对棋盘的处理函数，使得函数的组合仅仅包含函数，对棋盘的操作流程清晰可见，阅读代码不需要关注所需传入的数据。
 * 使用monads包装输出日志信息，记录对日志的操作函数，便于调试和避免代码的side effect
 * */
var AIvsAI_app = function (dimension, pc_color) {
    if (pc_color === void 0) { pc_color = Color.BLACK; }
    var start_time = Date.parse(new Date().toString());
    var checkerboard = helper_1.compose(// compose
    print_checkerboard, checkerboard_init)(dimension);
    var pc_palyer1 = helper_1.pipe(// pipe
    helper_1.curry_2(AIplayer)(pc_color), // curry 
    prinit_ai_choice, helper_1.curry(revere_pieces)(checkerboard), // curry 
    print_checkerboard);
    var pc_palyer2 = helper_1.pipe(// pipe
    helper_1.curry_2(AIplayer)(-pc_color), // curry
    prinit_ai_choice, helper_1.curry(revere_pieces)(checkerboard), // curry
    print_checkerboard);
    var invalid_input = run(checkerboard, pc_palyer1, pc_palyer2);
    mEnding_log(checkerboard, pc_color, invalid_input) // mondas
        .flatmap(mLog2console)
        .flatmap(mlog2CSV.bind(null, pc_color, checkerboard.length, start_time));
};
// PC 确定PC执棋颜色
var pc_checker_color = function () {
    var color = rl.question('Computer plays(X/O): ').toString().toLowerCase();
    return color === 'x' ? Color.BLACK : Color.WHITE;
};
// 主函数
var main = function () {
    // AIvsAI_app(8,1);
    // 确定棋盘规模
    var dimension = rl.question('Enter the board dimension: ');
    //确定PC执什么棋
    var pc_color = pc_checker_color();
    app(dimension, pc_color);
};
main();
