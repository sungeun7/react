import {useState, useMemo } from 'react';  // useMemo를 사용 하기 위해 임포트 한다.

const calcAverage = numbers => {
    console.log('평균 값 계산 중..');
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((a,b) => a+b);
    return sum / numbers.length;
};

const UsememoAverage = () => {
  const [list, setList] = useState([]);
  const [number, setNumber] = useState('');

  const onChange = e => {
      setNumber(e.target.value);
  };

  const onInsert = e => {
      const nextList = list.concat(parseInt(number));
      setList(nextList);
      setNumber('');
  };

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

export default UsememoAverage;