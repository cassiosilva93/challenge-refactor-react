import { useState, useEffect, Component } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

interface IFood {
  id: number;
  name: string;
  description: string;
  price: number,
  available: boolean;
  image: string;
}

type FoodFields = Omit<IFood, 'id' | 'available'>;

const Dashboard = (): JSX.Element => {
  const [foods, setFoods] = useState<IFood[]>([]);
  const [editingFood, setEditingFood] = useState<IFood>({} as IFood);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const { data } = await api.get("/foods");
      setFoods(data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(food: FoodFields): Promise<void> {
    try {
      const { data } = await api.post('/foods', {
        ...food,
        available: true,
      });

      setFoods([...foods, data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(food: FoodFields): Promise<void> {
    try {
      const { data } = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(food =>
        food.id !== data.id ? food : data,
      );

      setFoods([...foodsUpdated]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setFoods(foodsFiltered);
  }

  async function toggleModal(): Promise<void> {
    setIsModalOpen(!isModalOpen);
  }

  async function toggleEditModal(): Promise<void> {
    setIsEditModalOpen(!isEditModalOpen);
  }

  async function handleEditFood(food: IFood): Promise<void>{
    setEditingFood(food);
    setIsEditModalOpen(true);
  }

  return (
    <>
        <Header openModal={toggleModal} />
        <ModalAddFood
          isOpen={isModalOpen}
          setIsOpen={toggleModal}
          handleAddFood={handleAddFood}
        />
        <ModalEditFood
          isOpen={isEditModalOpen}
          setIsOpen={toggleEditModal}
          editingFood={editingFood}
          handleUpdateFood={handleUpdateFood}
        />

        <FoodsContainer data-testid="foods-list">
          {foods &&
            foods.map(food => (
              <Food
                key={food.id}
                food={food}
                handleDelete={handleDeleteFood}
                handleEditFood={handleEditFood}
              />
            ))}
        </FoodsContainer>
      </>
  )
}

export default Dashboard;
