import {useReducer} from 'react';

// 초기 count 상태(state) 설정
const initialState = {count:0};

//useReducer 첫번째 인자에 들어갈 reducer 함수
function reducer(state, action) {
    // [switch 문] 액션(action.type)에 따라 다른 작업 수행
    switch (action.type){
        case 'increment': // action.type이 increment 일 때, 상태(state) +1
            return {count:state.count +1};
        case 'decrement': // action.type이 decrement 일 때, 상태(state) -1
            return {count:state.count -1};
        default: // 아무 것도 해당 되지 않을 때
            throw new Error();
    }
}

const ReducerCounter = () => {
    // useReducer 선언 및 초기화(인자로 위에서 선언한 reducer와 initialState를 받는다)
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <div>
        <p>
            현재 Count는 <b> {state.count} </b> 입니다.
        </p>
        <button onClick={() => dispatch({type: 'decrement'})}>-</button>
        <button onClick={() => dispatch({type: 'increment'})}>+</button>
    </div>
  );
};


export default ReducerCounter