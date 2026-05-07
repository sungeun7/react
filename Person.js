import { useState, useEffect } from 'react';  //useEffect 사용을 위해 임포트 한다.

const Person = () => {
    const [name, setName ] = useState(''); // 이름 상태를 저장 하는 useState 선언
    const [location, setLocation ] = useState(''); // 사는곳 상태를 저장 하는 useState 선언

    // [이름] Input 상자 안에 텍스트를 적을 때마다 setName을 호출 하여 이름 상태 저장
    const onChangeName = (e) => {
        setName(e.target.value);
    }
    // [사는 곳] 위와 동일
    const onChangeLocation = (e) => {
        setLocation(e.target.value);
    }

    // [useEffect] 랜더링 될 마다 실행
    useEffect(() => {
    console.log('랜더링 완료 !')
    });

    // [useEffect] 마운트 + 이름(name) 변경될 떄마다
    useEffect(() => {
        console.log('이름 변화! / name:', name)
    }, [name]);

    // [useEffect] 마운트 + 사는 곳(location) 변경될 떄마다
    useEffect(() => {
        console.log('사는곳 변화! / location:', location)
    },[location]);

    return(
        <div>
            <input value={name} onChange={onChangeName} placeholder={'이름을 입력하세요'} />
            <b>이름 :</b> {name}
            <br/>
            <input value={location} onChange={onChangeLocation} placeholder={'사는 곳을 입력하세요'}/>
            <b>사는 곳 :</b> {location}
        </div>
    );
}

export default Person;