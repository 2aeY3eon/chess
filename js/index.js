function help() {
    let helpMsg = [
        "룩은 수직으로 공격할 수 있습니다.",
        "비숍의 스펠링은 B i s h o p 입니다.",
        "체크메이트 되면 패배합니다.",
        "제한시간은 30초입니다. 그 안에 기물을 두지 못하면 패배합니다.",
        "체스의 정점엔 문부일이 존재합니다.",
        "이 프로젝트는 엔트리를 사용하지 않았습니다",
        "킹의 이미지들은 실제 인물이 아닙니다.",
        "이 프로젝트의 버그를 찾지 마세요.",
        "체스판의 크기는 8*8입니다."
    ];
    let helpMsgCnt = helpMsg.length;

    randNum = Math.floor(Math.random()*helpMsgCnt);

    alert(`도움말\n\n${helpMsg[randNum]}`);
}