import {useState, useMemo, useCallback, useRef} from 'react';  // useRef를 사용 하기 위해 임포트 한다.

const calcAverage = numbers => {
    console.log('평균 값 계산 중..');
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((a,b) => a+b);
    return sum / numbers.length;
};

const UserefAverage = () => {
  const [list, setList] = useState([]);
  const [number, setNumber] = useState('');
  const inputEl = useRef(null); // useRef 선언 및 초기화

  //기존 onChange 내용을 useCallback으로 감싸준다.
  const onChange = useCallback(e => {
      setNumber(e.target.value);
  }, []); // (의존성 배열) 빈 배열 이므로 컴포넌트가 처음 렌더링 될 때만 함수를 생성 한다.

  //기존 onInsert 내용을 useCallback으로 감싸준다.
  const onInsert = useCallback(() => {
      const nextList = list.concat(parseInt(number));
      setList(nextList);
      setNumber('');
      inputEl.current.focus(); // [아래] input 태그 ref={} 값에 inputEL이 적용되었으므로, 해당 DOM(input)의 포커스를 줌
  }, [number, list]); // number 혹은 list가 바뀌었을 때만 함수를 생성한다.


  // 등록된 숫자 리스트의 내용이 바뀔 때만 calcAverage 함수가 호출된다.
  const averageValue = useMemo(() => calcAverage(list), [list])

  return (
    <div>
        <input value={number} onChange={onChange} ref={inputEl}/> {/* ref={useRef에 적용한 변수 입력} */}
        <button onClick={onInsert}>숫자 등록</button>
        <ul>
            {list.map((value, index) => (
                <li key={index}>{value}</li>
            ))}
        </ul>
        <div>
            <b>평균값:</b> {averageValue}
        </div>
    </div>
  );
};

export default UserefAverage;