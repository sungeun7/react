import { useState} from 'react';  // useState를 사용 하기 위한 임포트

const Counter = () => {
    const [count, setCount] = useState(1); // 카운트 상태를 저장하는 useState 선언

    return(
        <div>
            <p>
                현재 Count는 <b> {count} </b> 입니다.
            </p>
            //버튼 누를 때마다 Count 1씩 증가
            <button onClick={() => setCount(count +1)}>+1 증가</button>
            //버튼 누를 때마다 Count 1씩 감소
            <button onClick={() => setCount(count -1)}>-1 감소</button>
        </div>
    );
};

export default Counter;