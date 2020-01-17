/**
 * 所使用的的函数式方法有：
 * helper.ts中：memorize、curry、
 * reversi.ts中：map、reduce、foreach、every、filter、curry、curry_2、bind、compose、pipe、monads、maybe functor
 *  */

import{curry,curry_2,compose,pipe,range,zip,add,Writer,Maybe} from "./helper"
const rl = require('readline-sync');
const fs = require('fs');

/**
 * 0-未放置棋子，1-黑棋，2-白旗
 *  */ 
enum Color {
    BLACK=1,
    WHITE=-1,
    EMPTY=0
  }

//棋盘全零初始化
const board_zoro_init = (dim:number) => {  
    const init_position = dim / 2 - 1;
    let board : Array<Array<number>> = new Array<Array<number>>();
    for(let i = 0; i < dim ; ++i) {
        board.push([]);
        for(let j = 0; j < dim; ++j) {
            board[i][j] = Color.EMPTY;
        }
    }
    return board;
}

//棋盘状态初始化
const checkerboard_init=(dim:number)=>{
    let board = board_zoro_init(dim);
    let init_position = dim/2 - 1;
    board[init_position][init_position] = Color.WHITE;
    board[init_position][init_position + 1] = Color.BLACK;
    board[init_position + 1][init_position] = Color.BLACK;
    board[init_position + 1][init_position + 1] = Color.WHITE;
    return board;
}

/**
 * 打印棋盘状态。
 * 抽取函数中的固定模式为单一函数，使用map代替显式的for循环，使得代码简洁易读，
 * 使用了forEach函数遍历数组，代码精简，无副作用，可读性强
 * */
const print_checkerboard = (checkerboard:number[][])=>{
    var str_for_print : string = "" 
    str_for_print += "\t"
    str_for_print += range("a".charCodeAt(0),"a".charCodeAt(0)+checkerboard.length).map( //map
        (value: number)=>String.fromCharCode(value)
    ).join("\t")
    console.log( str_for_print)
    checkerboard.forEach((x:number[], index:number)=>{ //forEach、map
        console.log(num2char(index)  +'\t' + x.map((x)=>x===Color.EMPTY?' ': x===Color.BLACK?'X':'O').join('\t') + '\n\n')})
    return checkerboard;
}

//棋子
interface Piece {
    x: number; 
    y: number;
    color:Color;
}

//落子得分及落子后需翻转的棋子
type Result = {score:number, reversi_pieces:Piece[]}

// AI决策结果
interface Choice {
    src:Piece ;
    result:Result
}

// 棋子是否落在棋盘内
const in_checkerboard = (checkerboard:number[][], p:Piece )=>{  
    return p.y >=0 && p.x >=0 && p.x < checkerboard.length &&p.y < checkerboard.length
}

//当前位置是否已落子
const isOccupied=(checkerboard:number[][],piece:Piece)=>{  //change
    return checkerboard[piece.x][piece.y] != Color.EMPTY
}

/**
 * 计算当前位置落子得分。
 * 使用foreach函数遍历数组，代码精简、易读、无副作用
 * */
const cal_score = function(checkerboard:number[][], piece:Piece ):Result{
    let offset_x:Number[] = [-1, 0, 1];
    let offset_y:Number[] = [-1, 0, 1];
    let score:number = 0;
    let  reversi_pieces:Piece[]=[] 
    offset_x.forEach((dx:number)=>{  // forEach
        offset_y.forEach((dy:number)=>{ //forEach
            let x:number= piece.x + dx;
            let y:number =piece.y + dy;
            if(!(dx ===0 && dy === 0)&&in_checkerboard(checkerboard,{x:x,y:y,color:piece.color})){
                let temp_score:number = 0;
                while(piece.color + checkerboard[x][y] ===0) { // 得到最长直线
                    x += dx;
                    y += dy;
                    if(!in_checkerboard(checkerboard,{x:x,y:y,color:piece.color})) break;
                    ++temp_score; // 最长直线长度
                    
                }
                if(temp_score > 0 && in_checkerboard(checkerboard,{x:x,y:y,color:piece.color})&&Math.abs(piece.color + checkerboard[x][y])===2){  // 直线的另一端点是否为己方棋子(并且下一棋子必须不同，即分数大于0)
                    reversi_pieces.push({x,y,color:piece.color}) 
                    score +=temp_score // 得分累加
                }
            } 
        })
    })
    return {score:score,reversi_pieces:reversi_pieces};
}

/**
 * AI，计算AI策略。
 * 使用foreach函数遍历数组，代码精简、易读
 */
const AIplayer = (checkerboard:number[][], color:Color)=>{
        let res:Result={score:0,reversi_pieces:undefined};
        let res_row:number = -1;
        let res_col:number = -1;
        checkerboard.forEach((row:number[],row_index)=>{  // forEach
        row.forEach((piece:number,col_index)=>{ // forEach
            if (piece===Color.EMPTY){
               let curr_res:Result = cal_score(checkerboard,{x:row_index,y:col_index,color:color})
               if(curr_res.score > res.score){
                    res = curr_res;
                    res_row = row_index;
                    res_col = col_index;
               }
            }
        })
    })
    return {src:{x:res_row,y:res_col,color:color},result:res}
}

/**
 * 翻转棋子。
 * 使用foreach函数遍历数组，代码精简、易读、无副作用
 *  */ 
const revere_pieces = (checkerboard:number[][],choice:Choice )=>{
    let src:Piece = choice.src;
    let result:Result = choice.result;
    if(result.score === 0) return checkerboard;//没有需要翻转的棋子
    result.reversi_pieces.forEach((piece:Piece)=>{  // forEach
        let dx = range(src.x, piece.x);
        let dy = range(src.y, piece.y);
        if(dx.length > 0 && dy.length > 0){ //翻转对角线上棋子
            zip(dx,dy).forEach((p:number[])=>{  // forEach
                checkerboard[p[0]][p[1]] = src.color
            })
        }else {  //翻转上下左右棋子
            let index:number = 0
            let len:number = dx.length>dy.length?dx.length:dy.length;
            while(index < len){
                let x:number = dx.length===0?src.x:dx[index]
                let y:number = dy.length===0?src.y:dy[index]
                checkerboard[x][y] =src.color;
                ++index;
            }
        }
    })
    return checkerboard;
}

// 数字转字母
const num2char = (num:number)=>{
    return String.fromCharCode("a".charCodeAt(0) + num)
}

// 输出AI决策
const prinit_ai_choice = (ai_choice:Choice)=>{
    let log_info ="";
    if(ai_choice.result.score>0) 
    log_info='Computer places '+ (ai_choice.src.color===Color.BLACK?'X':'O')+' at '
    + num2char(ai_choice.src.x)+num2char(ai_choice.src.y);
    else log_info=(ai_choice.src.color===Color.BLACK?'X':'O')+' player has no valid move.';
    mLog2console(log_info);
    return ai_choice;
}

/***
 * 棋盘是否满了？
 * 使用map遍历并操作数组，避免了显式循环遍历数组，精简了代码，代码具有较好的可读性
 * 使用every 对数组是否满足某一条件进行判断，使得显式循环消失，代码精简
 * */
const isfull = (checkerboard:number[][])=>{ 
    return checkerboard.map(    // map
            (x:number[])=>x.every( // every
            (x:number)=>Math.abs(x)===1)    
        ).every((x)=>x);  //every  
}

/***
 * 是否仅剩一方棋子？
 * 使用map、every操作、遍历数组，避免了显式循环遍历数组，精简了代码，代码具有较好的可读性
 * */
const only_one = (checkerboard:number[][])=>{
    return (
        // 全黑
        checkerboard.map(   // map
        (x:number[])=>x.every(
            (x:number)=>x===Color.BLACK?true:false))
            .every(
                x=>x?true:false
            )
            ||    // 全白
    checkerboard.map(   // map
        (x:number[])=>x.every( // every
            (x:number)=>x===Color.WHITE?true:false))
            .every( // every
                x=>x?true:false
            )
    )
}

/***
 * 双方均无落子位置
 * 使用every遍历数组，避免了显式循环遍历数组，精简了代码，代码具有较好的可读性
 * 使用monads向控制台输出信息和记录操作日志，便于调试和避免代码的side effect
 * */
const no_more=(checkerboard:number[][])=>{
    if([AIplayer(checkerboard,Color.BLACK).result.score,
        AIplayer(checkerboard,Color.WHITE).result.score]
        .every(x=>x===0)){ //every
            mLog2console("Both players have no valid move.") //mondas
            return true;
        }  
    return false;
}

/***
 * 游戏结束？
 * 使用reduce遍历数组，避免了显式循环遍历数组，精简了代码，代码具有较好的可读性
 * */
const game_over=(checkerboard:number[][])=>{ 
    return[
        isfull(checkerboard), //  棋盘放满
        only_one(checkerboard), // 一方棋子被吃完
        no_more(checkerboard) // 双方均无落子位置
    ].reduce(   // reduce 
        (pre:boolean,cur:boolean)=>pre||cur
        ,false)
}

// 博弈
const run = (checkerboard:number[][],palyer1,player2)=>{
    let invalid_input = false;
    while(true){
        if (palyer1(checkerboard)===false ) {invalid_input=true; break;}  //输入位置不合法提前结束游戏
        if (game_over(checkerboard))   break;  // 游戏正常结束
        if (player2(checkerboard) ===false) {invalid_input=true; break;};  //输入位置不合法提前结束游戏
        if (game_over(checkerboard))   break;
       // 两名玩家都无可落子位置
    }
    return invalid_input;
}

/***
 * 游戏结束，得分清算。
 * 使用map遍历操作数组元素，避免了显式循环遍历数组，精简了代码，代码具有较好的可读性
 * 使用filter取出特定颜色的棋子，避免了显式循环遍历棋盘，精简了代码，代码具有较好的可读性
 * 通过找到固定的模式，把固定模式写为函数，使用reduce遍历数组，避免了显式循环遍历数组，精简了代码，代码具有较好的可读性
 * */
const score_clearing=(checkerboard:number[][],color:Color)=>{
    return checkerboard.map(    // map
        (x:number[])=>x.filter((value:number)=>value===color) // filter
        .map(Math.abs)  // map
        .reduce(add,0)  //reduce
    ).reduce(add,0); // reduce
}

// 谁赢了？
const who_win=(checkerboard:number[][],pc_color:Color,invalid_input:boolean)=>{
    if(invalid_input){
        return "Game over.\n"+(pc_color===Color.BLACK?'X':'O') + " player wins."
    }
    else{
        let player1_score = score_clearing(checkerboard,Color.BLACK);
        let player2_score = score_clearing(checkerboard,Color.WHITE);
        return "Game over.\nX : O = " + player1_score.toString() +' : '+ player2_score.toString()+'.\n'
        + ((player1_score === player2_score)?'Draw':
          ((player1_score > player2_score)?'X':'O') +' player wins.\n');
    }
}

/***
 * 字符串转为坐标。
 * 使用maybe处理玩家输入的字符串，对非法值进行过滤并获取所出入的合法坐标，
 * 减少了对可能出现的异常情况的处理，专注于实现算法逻辑，也使得对输入坐标的处理代码更为直观明了；
 * 底层数据结构实现的细节被抽象出来。不需要知道是否需要迭代，也不需要知道迭代是如何处理的。
 * map空的functor和正常的functor是一样的，空集合的情况下不需要切换逻辑。
 * */
const str2coordinate= (position:string)=>{  // maybe_functor 
    return Maybe.of(position).map(
        (x:string)=> x.toLowerCase()
    ).map(
        (s:string)=>[s.charCodeAt(0),s.charCodeAt(1)].map(((x:number)=>x - 'a'.charCodeAt(0)))
    ).map(
        (x:number[])=>{return {x:x[0],y:x[1],color:Color.EMPTY}}
    )
    .filter(
         (piece:Piece)=>piece.x>=0&&piece.x<26&&piece.y>=0&&piece.y<26
    ).orElse(
        {x:-1,y:-1,color:Color.BLACK}) // 返回一个非法值
}

// 输入落子位置
const input_position = (checkerboard:number[][],color:Color)=>{
    let position : string = rl.question('Enter move for ' + (color===Color.BLACK?'X':'O') + ' (RowCol): ');
    let p:Piece =  str2coordinate(position); //change
    if(!in_checkerboard(checkerboard,p)||isOccupied(checkerboard,p)||cal_score(checkerboard,{x:p.x,y:p.y,color:color}).score===0)   return false;
    return {x:p.x,y:p.y,color:color};
}

/***
 * 人类玩家。
 *  使用curry（curry_2），来预先设置函数的部分参数，使得二元函数及多元函数能够像一元函数那样compose、pipe
 * 使用pipe组合一系列对字符串的处理函数，使得函数的组合仅仅包含函数，对棋盘的操作流程清晰可见，阅读代码不需要关注所需传入的数据。
 * */
const human_palyer = (checkerboard:number[][],color:Color)=>{
    let pos = input_position(checkerboard,color);
    if (pos === false) return  false; //输入位置不合法，返回false，结束游戏
    const _cal_score = curry_2(cal_score)(pos); // curry_2
    return pipe(    // pipe
        _cal_score,
        curry((src:Piece,result:Result)=>{return {src:pos,result:result}})(pos), // curry
        prinit_ai_choice,curry(revere_pieces)(checkerboard),    // curry
        print_checkerboard)
        (checkerboard);
}

/**
*得到对局结束日志 
*使用monads包装对局结束日志信息，给定固定的输入，返回固定的输出，记录对日志的操作函数，便于调试和避免代码的side effect
* */
const mEnding_log=(checkerboard:number[][],pc_color:Color,invalid_input:boolean):Writer<string>=>{  // monads
    return Writer.of("gameover",
        (invalid_input?"Invalid move.\n":"")
         + who_win(checkerboard,pc_color,invalid_input));
}

/**
*输出对局日志到CSV文件
*使用monads包装对局结束日志信息，给定固定的输入，返回固定的输出，记录对日志的操作函数，便于调试和避免代码的side effect
*monads还可以构成类型提升函数
* */
const mlog2CSV=(pc_color:Color,dim:number,start_time:number,log_info:string)=>{
        const end_time :number = Date.parse(new Date().toString());
        let csv_info:string[] = []
        if(log_info.indexOf('Invalid') >-1){
            csv_info=[
                formatDate(),
                ((end_time-start_time)/1000).toString(),
                dim.toString() +"*" + dim.toString(),
                (pc_color===Color.BLACK?"computer,human":"human,computer"),
                "Human give up",
            ]
        }
        else{
            csv_info=[
                formatDate(),
                ((end_time-start_time)/1000).toString(),
                dim.toString() +"*" + dim.toString(),
                (pc_color===Color.BLACK?"computer,human":"human,computer"),
                /[\d]+ : [\d]+/igm.exec(log_info)[0].replace(":","to")
            ]
        }
        fs.writeFileSync('Reversi.csv', csv_info.join(",")+'\n',{flag:'a'});
        return Writer.of("Log to csv", "sucess");
    }

// 日期格式化
const formatDate = () => {
    const Dates = new Date();
    const Year : number = Dates.getFullYear(); 
    const Month : any = ( Dates.getMonth() + 1 ) < 10  ?  '0' + (Dates.getMonth() + 1) : ( Dates.getMonth() + 1); 
    const Day : any = Dates.getDate() < 10 ? '0' + Dates.getDate() : Dates.getDate();
    const Hour = Dates.getHours() < 10 ? '0' + Dates.getHours() : Dates.getHours();
    const Minute = Dates.getMinutes() < 10 ? '0' + Dates.getMinutes() : Dates.getMinutes();
    const Second = Dates.getSeconds() < 10 ? '0' + Dates.getSeconds() : Dates.getSeconds();
    return Year + '-' + Month + '-' + Day + ' ' + Hour + ':' + Minute + ':' + Second; 
}

/**
*输出对局信息到控制台
*使用monads包装输出日志信息，构成类型提升函数，记录对日志的操作函数，便于调试和避免代码的side effect
* */
const mLog2console=(log_info:string):Writer<string>=>Writer.of("console output:\n",console_print(log_info));

const console_print = (x:string)=>{
    console.log(x);
    return x;
}

/***
 * 人机对决APP。
 * 使用curry（curry_2）、partial（bind），来预先设置函数的部分参数，使得二元函数及多元函数能够像一元函数那样compose、pipe
 * 使用compose组合一系列对棋盘的处理函数，使得函数的组合仅仅包含函数，对棋盘的操作流程清晰可见，阅读代码不需要关注所需传入的数据。
 * 使用monads包装输出日志信息，做类型提升、记录对日志的操作函数，便于调试和避免代码的side effect
 * */
const app=(dimension:number, pc_color:number=Color.BLACK)=>{
    const start_time :number = Date.parse(new Date().toString());
    let checkerboard:number[][] = compose( // compose
        print_checkerboard,checkerboard_init
        )(dimension);
    const pc_palyer = pipe( // pipe
        curry_2(AIplayer)(pc_color),  // curry
        prinit_ai_choice,
        curry(revere_pieces)(checkerboard),  // curry
        print_checkerboard);
    const  _human_palyer = curry_2(human_palyer)(-pc_color);     // curry
    let invalid_input:boolean = pc_color===Color.BLACK?run(checkerboard,pc_palyer,_human_palyer):run(checkerboard,_human_palyer,pc_palyer);
    mEnding_log(checkerboard,pc_color,invalid_input)    // monads
    .flatmap(mLog2console)    // monads
    .flatmap(mlog2CSV.bind(null,pc_color,checkerboard.length,start_time)); // partial
}


/***
 * AI对决AI app。
 * 使用compose组合一系列对棋盘的处理函数，使得函数的组合仅仅包含函数，对棋盘的操作流程清晰可见，阅读代码不需要关注所需传入的数据。
 * 使用monads包装输出日志信息，记录对日志的操作函数，便于调试和避免代码的side effect
 * */
const AIvsAI_app = (dimension:number, pc_color:Color=Color.BLACK)=>{
    const start_time :number = Date.parse(new Date().toString());
    let checkerboard:number[][] = compose(  // compose
        print_checkerboard,checkerboard_init)
        (dimension);
    let pc_palyer1 = pipe(  // pipe
        curry_2(AIplayer)(pc_color),  // curry 
        prinit_ai_choice,curry(revere_pieces)(checkerboard),   // curry 
        print_checkerboard);
    let pc_palyer2 = pipe(   // pipe
        curry_2(AIplayer)(-pc_color),  // curry
        prinit_ai_choice,
        curry(revere_pieces)(checkerboard),  // curry
        print_checkerboard);
    let invalid_input:boolean = run(checkerboard,pc_palyer1,pc_palyer2);
    mEnding_log(checkerboard,pc_color,invalid_input)  // mondas
    .flatmap(mLog2console)
    .flatmap(mlog2CSV.bind(null,pc_color,checkerboard.length,start_time));
}

// PC 确定PC执棋颜色
const pc_checker_color = ()=>{
    const color:string = rl.question('Computer plays(X/O): ').toString().toLowerCase();
    return color==='x'?Color.BLACK:Color.WHITE;
}

// 主函数
const main =()=>{
    // AIvsAI_app(8,1);
    // 确定棋盘规模
    const dimension:number = rl.question('Enter the board dimension: ');
    //确定PC执什么棋
    let pc_color = pc_checker_color();
    app(dimension,pc_color);
}
main();


