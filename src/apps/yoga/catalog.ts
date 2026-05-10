export type CatalogEntry = {
  id: string
  name: string
  sanskrit: string
  category: string
}

export const catalog: CatalogEntry[] = [
  { id: 'mountain', name: 'Mountain Pose', sanskrit: 'Tadasana', category: 'Standing' },
  { id: 'standing-forward-fold', name: 'Standing Forward Fold', sanskrit: 'Uttanasana', category: 'Standing' },
  { id: 'half-forward-fold', name: 'Half Forward Fold', sanskrit: 'Ardha Uttanasana', category: 'Standing' },
  { id: 'tree', name: 'Tree Pose', sanskrit: 'Vrikshasana', category: 'Standing' },
  { id: 'warrior-1', name: 'Warrior I', sanskrit: 'Virabhadrasana I', category: 'Standing' },
  { id: 'warrior-2', name: 'Warrior II', sanskrit: 'Virabhadrasana II', category: 'Standing' },
  { id: 'warrior-3', name: 'Warrior III', sanskrit: 'Virabhadrasana III', category: 'Standing' },
  { id: 'triangle', name: 'Triangle Pose', sanskrit: 'Trikonasana', category: 'Standing' },
  { id: 'side-angle', name: 'Extended Side Angle', sanskrit: 'Utthita Parsvakonasana', category: 'Standing' },
  { id: 'chair', name: 'Chair Pose', sanskrit: 'Utkatasana', category: 'Standing' },
  { id: 'eagle', name: 'Eagle Pose', sanskrit: 'Garudasana', category: 'Standing' },
  { id: 'half-moon', name: 'Half Moon', sanskrit: 'Ardha Chandrasana', category: 'Standing' },
  { id: 'pyramid', name: 'Pyramid Pose', sanskrit: 'Parsvottanasana', category: 'Standing' },
  { id: 'high-lunge', name: 'High Lunge', sanskrit: 'Anjaneyasana', category: 'Standing' },
  { id: 'low-lunge', name: 'Low Lunge', sanskrit: 'Ashta Chandrasana', category: 'Standing' },
  { id: 'dancer', name: 'Dancer Pose', sanskrit: 'Natarajasana', category: 'Standing' },
  { id: 'goddess', name: 'Goddess Pose', sanskrit: 'Utkata Konasana', category: 'Standing' },
  { id: 'garland', name: 'Garland Pose', sanskrit: 'Malasana', category: 'Standing' },

  { id: 'seated-forward-fold', name: 'Seated Forward Fold', sanskrit: 'Paschimottanasana', category: 'Forward Fold' },
  { id: 'head-to-knee', name: 'Head-to-Knee Pose', sanskrit: 'Janu Sirsasana', category: 'Forward Fold' },
  { id: 'wide-angle-fold', name: 'Wide-Angle Seated Forward Fold', sanskrit: 'Upavistha Konasana', category: 'Forward Fold' },

  { id: 'easy', name: 'Easy Pose', sanskrit: 'Sukhasana', category: 'Seated' },
  { id: 'lotus', name: 'Lotus', sanskrit: 'Padmasana', category: 'Seated' },
  { id: 'half-lotus', name: 'Half Lotus', sanskrit: 'Ardha Padmasana', category: 'Seated' },
  { id: 'hero', name: 'Hero Pose', sanskrit: 'Virasana', category: 'Seated' },
  { id: 'staff', name: 'Staff Pose', sanskrit: 'Dandasana', category: 'Seated' },
  { id: 'bound-angle', name: 'Bound Angle', sanskrit: 'Baddha Konasana', category: 'Seated' },
  { id: 'boat', name: 'Boat Pose', sanskrit: 'Navasana', category: 'Seated' },

  { id: 'cobra', name: 'Cobra', sanskrit: 'Bhujangasana', category: 'Backbend' },
  { id: 'sphinx', name: 'Sphinx', sanskrit: 'Salamba Bhujangasana', category: 'Backbend' },
  { id: 'upward-dog', name: 'Upward-Facing Dog', sanskrit: 'Urdhva Mukha Svanasana', category: 'Backbend' },
  { id: 'bridge', name: 'Bridge', sanskrit: 'Setu Bandha Sarvangasana', category: 'Backbend' },
  { id: 'wheel', name: 'Wheel', sanskrit: 'Urdhva Dhanurasana', category: 'Backbend' },
  { id: 'camel', name: 'Camel', sanskrit: 'Ustrasana', category: 'Backbend' },
  { id: 'bow', name: 'Bow', sanskrit: 'Dhanurasana', category: 'Backbend' },
  { id: 'locust', name: 'Locust', sanskrit: 'Salabhasana', category: 'Backbend' },
  { id: 'fish', name: 'Fish', sanskrit: 'Matsyasana', category: 'Backbend' },

  { id: 'half-lord-of-fishes', name: 'Half Lord of the Fishes', sanskrit: 'Ardha Matsyendrasana', category: 'Twist' },
  { id: 'revolved-triangle', name: 'Revolved Triangle', sanskrit: 'Parivrtta Trikonasana', category: 'Twist' },
  { id: 'revolved-chair', name: 'Revolved Chair', sanskrit: 'Parivrtta Utkatasana', category: 'Twist' },
  { id: 'supine-twist', name: 'Supine Twist', sanskrit: 'Supta Matsyendrasana', category: 'Twist' },

  { id: 'downward-dog', name: 'Downward-Facing Dog', sanskrit: 'Adho Mukha Svanasana', category: 'Inversion' },
  { id: 'dolphin', name: 'Dolphin Pose', sanskrit: 'Catur Svanasana', category: 'Inversion' },
  { id: 'shoulder-stand', name: 'Shoulder Stand', sanskrit: 'Sarvangasana', category: 'Inversion' },
  { id: 'plow', name: 'Plow', sanskrit: 'Halasana', category: 'Inversion' },
  { id: 'headstand', name: 'Headstand', sanskrit: 'Sirsasana', category: 'Inversion' },
  { id: 'forearm-stand', name: 'Forearm Stand', sanskrit: 'Pincha Mayurasana', category: 'Inversion' },
  { id: 'handstand', name: 'Handstand', sanskrit: 'Adho Mukha Vrksasana', category: 'Inversion' },
  { id: 'legs-up-wall', name: 'Legs Up the Wall', sanskrit: 'Viparita Karani', category: 'Inversion' },

  { id: 'plank', name: 'Plank', sanskrit: 'Phalakasana', category: 'Arm Balance' },
  { id: 'side-plank', name: 'Side Plank', sanskrit: 'Vasisthasana', category: 'Arm Balance' },
  { id: 'crow', name: 'Crow', sanskrit: 'Bakasana', category: 'Arm Balance' },
  { id: 'side-crow', name: 'Side Crow', sanskrit: 'Parsva Bakasana', category: 'Arm Balance' },
  { id: 'eight-angle', name: 'Eight-Angle Pose', sanskrit: 'Astavakrasana', category: 'Arm Balance' },
  { id: 'firefly', name: 'Firefly', sanskrit: 'Tittibhasana', category: 'Arm Balance' },

  { id: 'pigeon', name: 'Pigeon Pose', sanskrit: 'Eka Pada Rajakapotasana', category: 'Hip Opener' },
  { id: 'lizard', name: 'Lizard', sanskrit: 'Utthan Pristhasana', category: 'Hip Opener' },
  { id: 'frog', name: 'Frog', sanskrit: 'Mandukasana', category: 'Hip Opener' },
  { id: 'happy-baby', name: 'Happy Baby', sanskrit: 'Ananda Balasana', category: 'Hip Opener' },
  { id: 'cow-face', name: 'Cow Face', sanskrit: 'Gomukhasana', category: 'Hip Opener' },

  { id: 'child', name: "Child's Pose", sanskrit: 'Balasana', category: 'Restorative' },
  { id: 'corpse', name: 'Corpse Pose', sanskrit: 'Savasana', category: 'Restorative' },
  { id: 'reclining-bound-angle', name: 'Reclining Bound Angle', sanskrit: 'Supta Baddha Konasana', category: 'Restorative' },
  { id: 'cat', name: 'Cat Pose', sanskrit: 'Marjaryasana', category: 'Restorative' },
  { id: 'cow', name: 'Cow Pose', sanskrit: 'Bitilasana', category: 'Restorative' },
  { id: 'thread-needle', name: 'Thread the Needle', sanskrit: 'Parsva Balasana', category: 'Restorative' },
]
