import GameFactory from '@/connect-4-domain/game';
import { MutableRefObject } from 'react';
import createGameApi, { GameApi } from '@/connect-4-ui/game-api';
import Overlay from './connect-4-ui/Overlay';
import { BoardProps, GridBoardCellProps } from '@/connect-4-ui/Board';
import { createPortal } from 'react-dom';
import LoadGameDialog from '@/connect-4-ui/LoadGameDialog';
import SavedGame from '@/connect-4-ui/SavedGame';
import { GameOverviewProps } from './connect-4-ui/GameOverview';
import { GameUuid } from './connect-4-domain/game-types';
import MongoGameRepository from './connect-4-domain/mongo-game-repository';
import InMemoryRepository from './connect-4-domain/in-memory-repository';

function resolveGameFactoryConfiguration() {
    const repository =
        import.meta.env.VITE_REPOSITORY === 'mongo'
            ? new MongoGameRepository()
            : new InMemoryRepository();

    return {
        boardDimensions: {
            rows: 6,
            columns: 7
        },
        repository
    };
}

export function createHandleStartGameClick(
    setActiveGame: (activeGame: {
        gameOverview: GameOverviewProps;
        board: BoardProps;
    }) => void,
    gameApiRef: MutableRefObject<GameApi | null>
): () => void {
    return function handleStartGameClick(): void {
        gameApiRef.current = createGameApi(
            new GameFactory(resolveGameFactoryConfiguration())
        );
        setActiveGame({
            gameOverview: {
                round: {
                    roundNumber: 1
                },
                playerRoundOverviews: {
                    playerOne: {
                        player: 1,
                        remainingDiscs: gameApiRef.current.getRemainingDiscs(1),
                        isActiveTurn:
                            gameApiRef.current.getActivePlayer() === 1,
                        discColour: 'yellow'
                    },
                    playerTwo: {
                        player: 2,
                        remainingDiscs: gameApiRef.current.getRemainingDiscs(2),
                        isActiveTurn:
                            gameApiRef.current.getActivePlayer() === 2,
                        discColour: 'red'
                    }
                },
                status: gameApiRef.current.getStatus()
            },
            board: {
                onClick: createHandleBoardCellClick(
                    gameApiRef.current,
                    setActiveGame
                ),
                cells: gameApiRef.current.getBoard()
            } satisfies BoardProps
        });
    };
}

export function createResetGameClick(
    setActiveGame: (activeGame: {
        gameOverview: GameOverviewProps;
        board: BoardProps;
    }) => void,
    gameApiRef: MutableRefObject<GameApi | null>
): () => void {
    if (gameApiRef.current === null) {
        return () => {};
    }

    return function handleResetGameClick(): void {
        gameApiRef.current!.resetGame();
        setActiveGame({
            gameOverview: {
                round: {
                    roundNumber: 1
                },
                playerRoundOverviews: {
                    playerOne: {
                        player: 1,
                        remainingDiscs:
                            gameApiRef.current!.getRemainingDiscs(1),
                        isActiveTurn:
                            gameApiRef.current!.getActivePlayer() === 1,
                        discColour: 'yellow'
                    },
                    playerTwo: {
                        player: 2,
                        remainingDiscs:
                            gameApiRef.current!.getRemainingDiscs(2),
                        isActiveTurn:
                            gameApiRef.current!.getActivePlayer() === 2,
                        discColour: 'red'
                    }
                },
                status: gameApiRef.current!.getStatus()
            },
            board: {
                onClick: createHandleBoardCellClick(
                    gameApiRef.current!,
                    setActiveGame
                ),
                cells: gameApiRef.current!.getBoard()
            } satisfies BoardProps
        });
    };
}

export function createHandleBoardCellClick(
    gameApi: GameApi,
    setActiveGame: (activeGame: {
        gameOverview: GameOverviewProps;
        board: BoardProps;
    }) => void
) {
    return function handleBoardCellClick({
        row,
        column
    }: GridBoardCellProps): void {
        const player = gameApi.getActivePlayer();
        const handlePlayerMove =
            gameApi.getBoard()[row][column].handlePlayerMove;
        handlePlayerMove(player);
        setActiveGame({
            gameOverview: {
                round: {
                    roundNumber: 1
                },
                playerRoundOverviews: {
                    playerOne: {
                        player: 1,
                        remainingDiscs: gameApi.getRemainingDiscs(1),
                        isActiveTurn: gameApi.getActivePlayer() === 1,
                        discColour: 'yellow'
                    },
                    playerTwo: {
                        player: 2,
                        remainingDiscs: gameApi.getRemainingDiscs(2),
                        isActiveTurn: gameApi.getActivePlayer() === 2,
                        discColour: 'red'
                    }
                },
                status: gameApi.getStatus()
            },
            board: {
                onClick: createHandleBoardCellClick(gameApi, setActiveGame),
                cells: gameApi.getBoard()
            } satisfies BoardProps
        });
    };
}

export function createHandleSaveGameClick(
    setSavedGames: React.Dispatch<React.SetStateAction<GameUuid[]>>,
    gameApi: GameApi | null
): () => void {
    if (gameApi === null) {
        return () => {};
    }

    return async function handleSaveGameClick(): Promise<void> {
        const newGameId = await gameApi.saveGame();
        setSavedGames((prevSavedGames: GameUuid[]): GameUuid[] => [
            ...prevSavedGames,
            newGameId
        ]);
    };
}

export function createHandleLoadGameClick(
    setActiveGame: (activeGame: {
        gameOverview: GameOverviewProps;
        board: BoardProps;
    }) => void,
    setShowOverlay: (value: boolean) => void,
    gameApi: GameApi
): (gameId: GameUuid) => void {
    return async function handleLoadGameClick(gameId: GameUuid): Promise<void> {
        setShowOverlay(false);
        await gameApi.loadGame(gameId);
        setActiveGame({
            gameOverview: {
                round: {
                    roundNumber: 1
                },
                playerRoundOverviews: {
                    playerOne: {
                        player: 1,
                        remainingDiscs: gameApi.getRemainingDiscs(1),
                        isActiveTurn: gameApi.getActivePlayer() === 1,
                        discColour: 'yellow'
                    },
                    playerTwo: {
                        player: 2,
                        remainingDiscs: gameApi.getRemainingDiscs(2),
                        isActiveTurn: gameApi.getActivePlayer() === 2,
                        discColour: 'red'
                    }
                },
                status: gameApi.getStatus()
            },
            board: {
                onClick: createHandleBoardCellClick(gameApi, setActiveGame),
                cells: gameApi.getBoard()
            } satisfies BoardProps
        });
    };
}

export function createHandleDeleteGameClick(
    setSavedGames: React.Dispatch<React.SetStateAction<GameUuid[]>>,
    gameApi: GameApi | null
): (gameId: GameUuid) => void {
    if (gameApi === null) {
        return () => {};
    }

    return async function handleDeleteGameClick(
        gameId: GameUuid
    ): Promise<void> {
        await gameApi.deleteGame(gameId);
        setSavedGames((prevSavedGames) => [
            ...prevSavedGames.filter((savedGameId) => savedGameId !== gameId)
        ]);
    };
}

export function createLoadGameDialog(
    savedGames: GameUuid[],
    setSavedGames: React.Dispatch<React.SetStateAction<GameUuid[]>>,
    gameApi: GameApi,
    setActiveGame: (activeGame: {
        gameOverview: GameOverviewProps;
        board: BoardProps;
    }) => void,
    setShowOverlay: (value: boolean) => void
) {
    return createPortal(
        <Overlay
            componentSpec={{
                Component: ({
                    handleClose
                }: {
                    handleClose: () => void;
                }): React.ReactElement<typeof LoadGameDialog> => (
                    <LoadGameDialog handleClose={handleClose}>
                        {savedGames.map(
                            (
                                gameId: GameUuid
                            ): React.ReactElement<typeof SavedGame> => (
                                <SavedGame
                                    key={gameId}
                                    gameId={gameId}
                                    savedDate={new Date()}
                                    handleLoadGame={createHandleLoadGameClick(
                                        setActiveGame,
                                        setShowOverlay,
                                        gameApi
                                    )}
                                    handleDeleteGame={createHandleDeleteGameClick(
                                        setSavedGames,
                                        gameApi
                                    )}
                                />
                            )
                        )}
                    </LoadGameDialog>
                ),
                props: {
                    handleClose: () => {
                        setShowOverlay(false);
                    }
                }
            }}
        ></Overlay>,
        document.body
    );
}
