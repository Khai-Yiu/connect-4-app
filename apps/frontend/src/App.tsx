import { GameplayArea } from '@/connect-4-ui/GameplayArea';
import '@/App.css';
import '@/connect-4-ui/GameplayArea';
import { useRef, useState } from 'react';
import { GameOverviewProps } from '@/connect-4-ui/GameOverview';
import { BoardProps } from '@/connect-4-ui/Board';
import { GameUuid } from '@/connect-4-domain/game-types';

import {
    createHandleSaveGameClick,
    createHandleStartGameClick,
    createLoadGameDialog,
    createResetGameClick
} from '@/app-handlers';

const App = () => {
    const [activeGame, setActiveGame] = useState<{
        gameOverview: GameOverviewProps;
        board: BoardProps;
    }>();
    const [savedGames, setSavedGames] = useState<GameUuid[]>([]);
    const [showOverlay, setShowOverlay] = useState<Boolean>(false);
    const gameApiRef = useRef(null);

    return (
        <>
            {showOverlay &&
                createLoadGameDialog(
                    savedGames,
                    setSavedGames,
                    gameApiRef.current!,
                    setActiveGame,
                    setShowOverlay
                )}
            <GameplayArea
                activeGame={activeGame}
                onStartGameClick={createHandleStartGameClick(
                    setActiveGame,
                    gameApiRef
                )}
                onResetGameClick={createResetGameClick(
                    setActiveGame,
                    gameApiRef
                )}
                onSaveGameClick={createHandleSaveGameClick(
                    setSavedGames,
                    gameApiRef.current
                )}
                onLoadGameClick={() => setShowOverlay(true)}
            />
        </>
    );
};

export default App;
