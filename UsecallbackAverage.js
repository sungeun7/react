import {useState, useMemo, useCallback} from 'react';  // useMemo를 사용 하기 위해 임포트 한다.

const calcAverage = numbers => {
    console.log('평균 값 계산 중..');
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((a,b) => a+b);
    return sum / numbers.length;
};

const UsecallbackAverage = () => {
  const [list, setList] = useState([]);
  const [number, setNumber] = useState('');

  //기존 onChange 내용을 useCallback으로 감싸준다.
  const onChange = useCallback(e => {
      setNumber(e.target.value);
  }, []); // (의존성 배열) 빈 배열 이므로 컴포넌트가 처음 렌더링 될 때만 함수를 생성 한다.

  //기존 onInsert 내용을 useCallback으로 감싸준다.
  const onInsert = useCallback(() => {
      const nextList = list.concat(parseInt(number));
      setList(nextList);
      setNumber('');
  }, [number, list]); // number 혹은 list가 바뀌었을 때만 함수를 생성한다.


  // 등록된 숫자 리스트의 내용이 바뀔 때만 calcAverage 함수가 호출된다.
  const averageValue = useMemo(() => calcAverage(list), [list])

  return (
    <div>
        <input value={number} onChange={onChange} />
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

export default UsecallbackAverage;